const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const token = '8884423430:AAGbbPC8cYHH1Iy-5n1QIcn79iILXIDISSE';

const bot = new TelegramBot(token, { polling: true });

const commands = new Map();
bot.commands = commands;

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
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (config.whitelistMode) {
        const isWhitelisted = config.whitelistedIDs.includes(userId);
        const isAdmin = config.adminIDs.includes(userId) || userId === config.ownerID;
        
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
            `📁 *Auto-Loader Active:* \`commands\` ফোল্ডারে ফাইল যোগ করলেই স্বয়ংক্রিয়ভাবে কাজ করবে।`,
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

            if (command.adminOnly) {
                const isAdmin = config.adminIDs.includes(userId) || userId === config.ownerID;
                if (!isAdmin) {
                    return bot.sendMessage(chatId, '❌ *এই কমান্ডটি শুধুমাত্র বটের ওনার বা অ্যাডমিন ব্যবহার করতে পারবে!*', { parse_mode: 'Markdown' });
                }
            }

            try {
                return await command.execute(bot, msg, args.join(' '));
            } catch (error) {
                console.error(`Error executing ${commandName}:`, error);
                return bot.sendMessage(chatId, '❌ *কমান্ডটি রান করতে কোনো সমস্যা হয়েছে!*', { parse_mode: 'Markdown' });
            }
        } else {
            return bot.sendMessage(
                chatId,
                `❌ *"/${commandName}" কমান্ডটি নেই!*\n\n👉 *সব কমান্ড দেখতে "/help" লিখুন।*`,
                { parse_mode: 'Markdown' }
            );
        }
    }
});

console.log('🚀 Bot is running successfully with Token!');
