const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// আপনার প্রদানকৃত টেলিগ্রাম বট টোকেন
const token = '8884423430:AAGbbPC8cYHH1Iy-5n1QIcn79iILXIDISSE';

const bot = new TelegramBot(token, { polling: true });

const commands = new Map();
const commandsDir = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir);
}

function loadCommands() {
    commands.clear();
    const files = fs.readdirSync(commandsDir);
    
    for (const file of files) {
        if (file.endsWith('.js')) {
            const filePath = path.join(commandsDir, file);
            delete require.cache[require.resolve(filePath)];
            try {
                const command = require(filePath);
                if (command.name && typeof command.execute === 'function') {
                    commands.set(command.name, command);
                    console.log(`✅ Loaded module: [${command.name}]`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error.message);
            }
        }
    }
}

loadCommands();

fs.watch(commandsDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`🔄 New file detected in commands folder. Auto-reloading...`);
        loadCommands();
    }
});

bot.on('message', async (msg) => {
    const text = msg.text ? msg.text.trim() : '';
    if (!text) return;

    if (text === '/start') {
        return bot.sendMessage(
            msg.chat.id,
            `🤖 *Welcome to Universal Telegram Bot!*\n\n` +
            `📹 *Video Downloader:* যেকোনো ফেসবুক বা ভিডিও লিংক পাঠালে অটোমেটিক ডাউনলোড হবে।\n` +
            `🤖 *AI Chat:* \`/ai আপনার প্রশ্ন\`\n` +
            `🎨 *AI Image:* \`/img ছবির বিবরণ\`\n\n` +
            `📁 *Auto-Loader Active:* \`commands\` ফোল্ডারে ফাইল যোগ করলেই স্বয়ংক্রিয়ভাবে ফিচার চাল হয়ে যাবে।`,
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
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            return command.execute(bot, msg, args.join(' '));
        }
    }
});

console.log('🚀 Bot is running successfully with Token!');
