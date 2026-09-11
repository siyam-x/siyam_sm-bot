const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const token = config.botToken;
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
    if (!command) return;

    const cmdName = command.name || command.config?.name;
    const cmdExecute = command.execute || command.onStart;

    if (cmdName && typeof cmdExecute === 'function') {
        const lowerName = cmdName.toLowerCase();
        commands.set(lowerName, command);

        const aliasList = command.aliases || command.config?.aliases;
        if (aliasList) {
            const list = Array.isArray(aliasList) ? aliasList : [aliasList];
            list.forEach(alias => {
                if (alias) aliases.set(alias.toLowerCase(), lowerName);
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
            console.log(`🔄 Changes detected in ${path.basename(dir)}. Reloading...`);
            loadAllModules();
        }
    });
});

function getUserRole(userId) {
    if (userId === config.ownerID || (config.adminIDs && config.adminIDs.includes(userId))) {
        return 2; // Super Admin / Owner
    }
    if (config.modIDs && config.modIDs.includes(userId)) {
        return 1; // Moderator
    }
    return 0; // Regular User
}

// ==================== CALLBACK QUERY HANDLER ====================
bot.on('callback_query', async (query) => {
    const data = query.data;
    if (!data) return;

    try {
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
                    if (handled) eventHandled = true;
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
            return bot.sendMessage(chatId, '⚠️ *এই বটটি বর্তমানে প্রাইভেট মোডে রয়েছে। আপনার এটি ব্যবহারের পারমিশন নেই।*', { parse_mode: 'Markdown' });
        }
    }

    if (!text) return;

    const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

    if (text === '/start' || (currentPrefix && text === `${currentPrefix}start`)) {
        return bot.sendMessage(
            chatId,
            `🤖 **Welcome to Telegram Bot!**\n\n` +
            `📜 **All Commands:** \`${currentPrefix}help\`\n` +
            `🛠 **Admin Control:** \`${currentPrefix}cmd\`\n\n` +
            `📂 **Auto-Loader:** Active and watching for script changes.`,
            { parse_mode: 'Markdown' }
        );
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
            const requiredRole = command.role !== undefined ? command.role : (command.config?.role !== undefined ? command.config.role : 0);

            if (userRole < requiredRole) {
                return bot.sendMessage(chatId, `❌ **এই কমান্ডটি ব্যবহারের অনুমতি নেই! (প্রয়োজনীয় রোল: Role ${requiredRole})**`, { parse_mode: 'Markdown' });
            }

            try {
                const execFunc = command.execute || command.onStart;
                return await execFunc(bot, msg, args, { role: userRole, prefix: currentPrefix });
            } catch (error) {
                console.error(`Error executing ${actualCommandName}:`, error);
                return bot.sendMessage(chatId, '❌ **কমান্ডটি রান করতে সমস্যা হয়েছে!**', { parse_mode: 'Markdown' });
            }
        } else {
            return bot.sendMessage(
                chatId,
                `❌ **"${currentPrefix}${inputCommand}" নাম নিয়ে কোনো কমান্ড পাওয়া যায়নি।**\n👉 সকল কমান্ড জানতে \`${currentPrefix}help\` টাইপ করুন।`,
                { parse_mode: 'Markdown' }
            );
        }
    }
});

console.log('🚀 Telegram Bot Engine Active and Ready!');
