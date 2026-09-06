const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const token = '8884423430:AAGbbPC8cYHH1Iy-5n1QIcn79iILXIDISSE';

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
    if (command.name && typeof command.execute === 'function') {
        commands.set(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                aliases.set(alias, command.name);
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
                    console.log(`✅ Loaded ${label}: [${command.name || file}]`);
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

bot.on('message', async (msg) => {
    const text = msg.text ? msg.text.trim() : '';
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (fs.existsSync(eventsDir)) {
        const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            try {
                const eventPath = path.join(eventsDir, file);
                delete require.cache[require.resolve(eventPath)];
                const event = require(eventPath);
                if (event.execute && typeof event.execute === 'function') {
                    event.execute(bot, msg);
                }
            } catch (err) {
                console.error(`Event ${file} Error:`, err.message);
            }
        }
    }

    if (config.whitelistMode) {
        const isWhitelisted = config.whitelistedIDs && config.whitelistedIDs.includes(userId);
        const isAdmin = (config.adminIDs && config.adminIDs.includes(userId)) || userId === config.ownerID;
        
        if (!isWhitelisted && !isAdmin) {
            return bot.sendMessage(chatId, '⚠️ *এই বটটি বর্তমানে প্রাইভেট মোডে আছে। আপনার ব্যবহারের অনুমতি নেই।*', { parse_mode: 'Markdown' });
        }
    }

    if (!text) return;

    if (text === '/start') {
        return bot.sendMessage(
            chatId,
            `🤖 *Welcome to Universal Telegram Bot!*\n\n` +
            `📹 *Video Downloader:* যেকোনো ভিডিও লিংক পাঠালে অটোমেটিক ডাউনলোড হবে।\n` +
            `🤖 *AI Chat:* \`/ai আপনার প্রশ্ন\`\n` +
            `🎨 *AI Image:* \`/img ছবির বিবরণ\`\n` +
            `👶 *Baby Chat:* \`/baby কথা\`\n` +
            `👤 *Profile Picture:* \`/pp\`\n` +
            `ℹ️ *Info:* \`/info\`\n` +
            `📜 *All Commands:* \`/help\`\n\n` +
            `📁 *Auto-Loader Active:* \`commands\`, \`events\`, এবং \`private\` ফোল্ডারে ফাইল যোগ করলেই স্বয়ংক্রিয়ভাবে কাজ করবে।`,
            { parse_mode: 'Markdown' }
        );
    }

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    if (urlRegex.test(text) && !text.startsWith('/')) {
        const downloader = commands.get('downloader');
        if (downloader) {
            return downloader.execute(bot, msg, text);
        }
    }

    if (text.startsWith('/')) {
        const args = text.slice(1).split(/ +/);
        const inputCommand = args.shift().toLowerCase();

        const actualCommandName = commands.has(inputCommand) ? inputCommand : aliases.get(inputCommand);

        if (actualCommandName && commands.has(actualCommandName)) {
            const command = commands.get(actualCommandName);

            if (command.adminOnly) {
                const isAdmin = (config.adminIDs && config.adminIDs.includes(userId)) || userId === config.ownerID;
                if (!isAdmin) {
                    return bot.sendMessage(chatId, '❌ *এই কমান্ডটি শুধুমাত্র বটের ওনার বা অ্যাডমিন ব্যবহার করতে পারবে!*', { parse_mode: 'Markdown' });
                }
            }

            try {
                return await command.execute(bot, msg, args.join(' '));
            } catch (error) {
                console.error(`Error executing ${actualCommandName}:`, error);
                return bot.sendMessage(chatId, '❌ *কমান্ডটি রান করতে কোনো সমস্যা হয়েছে!*', { parse_mode: 'Markdown' });
            }
        } else {
            return bot.sendMessage(
                chatId,
                `❌ *"/${inputCommand}" কমান্ডটি নেই!*\n\n👉 *সব কমান্ড দেখতে "/help" লিখুন।*`,
                { parse_mode: 'Markdown' }
            );
        }
    }
});

console.log('🚀 Bot is running successfully with Token!');
