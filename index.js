const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const bot = new TelegramBot(config.botToken, { polling: true });

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

function getUserRole(userId) {
    if (userId === config.ownerID || (config.adminIDs && config.adminIDs.includes(userId))) {
        return 2;
    }
    if (config.role1IDs && config.role1IDs.includes(userId)) {
        return 1;
    }
    return 0;
}

bot.on('message', async (msg) => {
    const text = msg.text ? msg.text.trim() : '';
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userRole = getUserRole(userId);

    if (config.bannedUsers && config.bannedUsers.includes(userId)) {
        return bot.sendMessage(chatId, 'আপনি ব্যান');
    }

    if (fs.existsSync(eventsDir)) {
        const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            try {
                const eventPath = path.join(eventsDir, file);
                delete require.cache[require.resolve(eventPath)];
                const event = require(eventPath);
                if (event.execute && typeof event.execute === 'function') {
                    event.execute(bot, msg, userRole);
                }
            } catch (err) {
                console.error(`Event ${file} Error:`, err.message);
            }
        }
    }

    if (config.whitelistMode) {
        const isWhitelisted = config.whitelistedIDs && config.whitelistedIDs.includes(userId);
        if (!isWhitelisted && userRole < 2) {
            return bot.sendMessage(chatId, '⚠️ এই বটটি বর্তমানে প্রাইভেট মোডে আছে। আপনার ব্যবহারের অনুমতি নেই।');
        }
    }

    if (!text) return;

    const currentPrefix = config.prefix;

    if (text === '/start' || text === `${currentPrefix}start`) {
        return bot.sendMessage(
            chatId,
            `🤖 Welcome to Telegram Bot!\n\nPrefix: ${currentPrefix}\nYour Role: ${userRole}\n\nType ${currentPrefix}ping to test.`
        );
    }

    let commandText = '';
    if (currentPrefix === '' || text.startsWith(currentPrefix)) {
        commandText = currentPrefix === '' ? text : text.slice(currentPrefix.length);
    } else {
        return;
    }

    const args = commandText.split(/ +/);
    const inputCommand = args.shift().toLowerCase();

    if (!inputCommand) return;

    const actualCommandName = commands.has(inputCommand) ? inputCommand : aliases.get(inputCommand);

    if (actualCommandName && commands.has(actualCommandName)) {
        const command = commands.get(actualCommandName);

        const requiredRole = command.role || 0;
        if (userRole < requiredRole) {
            return bot.sendMessage(chatId, `❌ এই কমান্ডটি ব্যবহার করার অনুমতি আপনার নেই! (Required Role: ${requiredRole})`);
        }

        try {
            return await command.execute(bot, msg, args, { role: userRole });
        } catch (error) {
            console.error(`Error executing ${actualCommandName}:`, error);
            return bot.sendMessage(chatId, '❌ কমান্ডটি রান করতে কোনো সমস্যা হয়েছে!');
        }
    } else {
        return bot.sendMessage(
            chatId,
            `❌ "${inputCommand}" কমান্ডটি নেই!`
        );
    }
});

console.log('🚀 Telegram Bot is running successfully!');
