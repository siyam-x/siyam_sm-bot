const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const token = config.botToken || '8973277623:AAE8rALePkquP5UaQJNShK45U8AQ-Q6VBlc';

const bot = new TelegramBot(token, { polling: true });

const commands = new Map();
const aliases = new Map();
bot.commands = commands;
bot.aliases = aliases;

const commandsDir = path.join(__dirname, 'commands');
const eventsDir = path.join(__dirname, 'events');
const privateDir = path.join(__dirname, 'private');

[commandsDir, eventsDir, privateDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function registerCommand(command) {
    const cmdName = command.name || command.config?.name;
    const cmdExecute = command.execute || command.onStart;

    if (cmdName && typeof cmdExecute === 'function') {
        commands.set(cmdName, command);
        const aliasList = command.aliases || command.config?.aliases;
        if (aliasList && Array.isArray(aliasList)) {
            aliasList.forEach(alias => {
                aliases.set(alias, cmdName);
            });
        }
    }
}

function loadAllModules() {
    commands.clear();
    aliases.clear();

    const loadFromDirectory = (dirPath, label) => {
        if (!fs.existsSync(dirPath)) return;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (file.endsWith('.js')) {
                const filePath = path.join(dirPath, file);
                delete require.cache[require.resolve(filePath)];
                try {
                    const command = require(filePath);
                    registerCommand(command);
                    console.log(`✅ Loaded ${label}: [${command.name || command.config?.name || file}]`);
                } catch (error) {
                    console.error(`❌ Error loading ${file} from ${label}:`, error.message);
                }
            }
        }
    };

    loadFromDirectory(commandsDir, 'commands');
    loadFromDirectory(privateDir, 'private');
}

loadAllModules();

[commandsDir, privateDir].forEach(dir => {
    fs.watch(dir, (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
            console.log(`🔄 Changes detected in ${path.basename(dir)}. Auto-reloading...`);
            loadAllModules();
        }
    });
});

function getUserRole(userId) {
    if (userId === config.ownerID || (config.adminIDs && config.adminIDs.includes(userId))) {
        return 2;
    }
    if (config.role1IDs && config.role1IDs.includes(userId)) {
        return 1;
    }
    return 0;
}

// ==================== CALLBACK QUERY HANDLER (NEW) ====================
bot.on('callback_query', async (query) => {
    const data = query.data;
    if (!data) return;

    try {
        // YTB Command Callbacks
        if (data.startsWith('ytdl_')) {
            const ytbCmd = commands.get('ytb') || commands.get('yt');
            if (ytbCmd && typeof ytbCmd.handleCallback === 'function') {
                return await ytbCmd.handleCallback(bot, query);
            }
        }

        // CMD Manager Callbacks
        if (data.startsWith('cmd_')) {
            const cmdManager = commands.get('cmd');
            if (cmdManager && typeof cmdManager.handleCallback === 'function') {
                return await cmdManager.handleCallback(bot, query);
            }
        }
    } catch (err) {
        console.error('Callback Query Error:', err.message);
    }
});

// ==================== MESSAGE HANDLER ====================
bot.on('message', async (msg) => {
    const text = msg.text ? msg.text.trim() : '';
    const chatId = msg.chat.id;
    const userId = msg.from ? msg.from.id : 0;
    const userRole = getUserRole(userId);

    if (config.bannedUsers && config.bannedUsers.includes(userId)) {
        return bot.sendMessage(chatId, 'আপনি ব্যান');
    }

    let eventHandled = false;
    if (fs.existsSync(eventsDir)) {
        const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            try {
                const eventPath = path.join(eventsDir, file);
                delete require.cache[require.resolve(eventPath)];
                const event = require(eventPath);
                if (event.execute && typeof event.execute === 'function') {
                    const handled = await event.execute(bot, msg, userRole);
                    if (handled) {
                        eventHandled = true;
                    }
                }
            } catch (err) {
                console.error(`Event ${file} Error:`, err.message);
            }
        }
    }

    if (eventHandled) return;

    if (config.whitelistMode) {
        const isWhitelisted = config.whitelistedIDs && config.whitelistedIDs.includes(userId);
        if (!isWhitelisted && userRole < 2) {
            return bot.sendMessage(chatId, '⚠️ *এই বটটি বর্তমানে প্রাইভেট মোডে আছে। আপনার ব্যবহারের অনুমতি নেই।*', { parse_mode: 'Markdown' });
        }
    }

    if (!text) return;

    const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

    if (text === '/start' || (currentPrefix && text === `${currentPrefix}start`)) {
        return bot.sendMessage(
            chatId,
            `🤖 *Welcome to Universal Telegram Bot!*\n\n` +
            `📹 *Video Downloader:* যেকোনো ভিডিও লিংক পাঠালে অটোমেটিক ডাউনলোড হবে।\n` +
            `🤖 *AI Chat:* \`${currentPrefix}ai আপনার প্রশ্ন\`\n` +
            `👤 *About/Info:* \`${currentPrefix}about\`\n` +
            `📜 *All Commands:* \`${currentPrefix}help\`\n\n` +
            `📁 *Auto-Loader Active:* \`commands\`, \`events\`, এবং \`private\` ফোল্ডারে ফাইল যোগ করলেই স্বয়ংক্রিয়ভাবে কাজ করবে।`,
            { parse_mode: 'Markdown' }
        );
    }

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    if (urlRegex.test(text) && !text.startsWith('/') && !text.startsWith(currentPrefix)) {
        const downloader = commands.get('downloader');
        if (downloader) {
            const execFunc = downloader.execute || downloader.onStart;
            return execFunc(bot, msg, text);
        }
    }

    let isCommand = false;
    let commandText = '';

    if (text.startsWith('/')) {
        isCommand = true;
        commandText = text.slice(1);
    } else if (currentPrefix !== '' && text.startsWith(currentPrefix)) {
        isCommand = true;
        commandText = text.slice(currentPrefix.length);
    }

    if (isCommand) {
        const args = commandText.split(/ +/);
        const inputCommand = args.shift().toLowerCase();

        if (!inputCommand) return;

        const actualCommandName = commands.has(inputCommand) ? inputCommand : aliases.get(inputCommand);

        if (actualCommandName && commands.has(actualCommandName)) {
            const command = commands.get(actualCommandName);

            const requiredRole = command.role !== undefined ? command.role : (command.config?.role !== undefined ? command.config.role : (command.adminOnly ? 2 : 0));
            if (userRole < requiredRole) {
                return bot.sendMessage(chatId, `❌ *এই কমান্ডটি ব্যবহার করার অনুমতি আপনার নেই! (Required Role: ${requiredRole})*`, { parse_mode: 'Markdown' });
            }

            try {
                const execFunc = command.execute || command.onStart;
                return await execFunc(bot, msg, args, { role: userRole, prefix: currentPrefix });
            } catch (error) {
                console.error(`Error executing ${actualCommandName}:`, error);
                return bot.sendMessage(chatId, '❌ *কমান্ডটি রান করতে কোনো সমস্যা হয়েছে!*', { parse_mode: 'Markdown' });
            }
        } else {
            return bot.sendMessage(
                chatId,
                `❌ *"/${inputCommand}" কমান্ডটি নেই!*\n\n👉 *সব কমান্ড দেখতে "${currentPrefix}help" লিখুন।*`,
                { parse_mode: 'Markdown' }
            );
        }
    }
});

console.log('🚀 Bot is running successfully with Token!');
