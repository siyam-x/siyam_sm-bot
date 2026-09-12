const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

process.on('uncaughtException', (err) => {
    console.error('Crash Prevented - Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Crash Prevented - Unhandled Rejection:', reason);
});

const token = config.botToken;

const langPath = path.join(__dirname, 'en.lang.txt');
let langData = {};

function loadLangFile() {
    if (fs.existsSync(langPath)) {
        const content = fs.readFileSync(langPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.includes('=') && !line.startsWith('#')) {
                const index = line.indexOf('=');
                const key = line.substring(0, index).trim();
                const val = line.substring(index + 1).trim();
                langData[key] = val;
            }
        }
    }
}
loadLangFile();

function getLangText(key, placeholders = []) {
    let text = langData[key] || '';
    if (!text) return '';
    placeholders.forEach((val, idx) => {
        text = text.replace(new RegExp(`%${idx + 1}`, 'g'), val);
    });
    text = text.replace(/\\n/g, '\n');
    return text;
}

const bot = new TelegramBot(token, { 
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

bot.on('polling_error', (error) => {
    console.log(`[Polling Error]: ${error.message}`);
});

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
                    console.log(`Loaded ${label}: [${command.name || command.config?.name || file}]`);
                } catch (error) {
                    console.error(`Error loading ${file} from ${label}:`, error.message);
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
            console.log(`Changes detected in ${path.basename(dir)}. Reloading...`);
            loadAllModules();
        }
    });
});

function getUserRole(userId) {
    if (userId === config.ownerID || (config.adminIDs && config.adminIDs.includes(userId))) {
        return 2;
    }
    if (config.modIDs && config.modIDs.includes(userId)) {
        return 1;
    }
    return 0;
}

const activeReplies = new Map();

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

bot.on('message', async (msg) => {
    try {
        if (!msg) return;

        const text = msg.text ? msg.text.trim() : '';
        const chatId = msg.chat.id;
        const userId = msg.from ? msg.from.id : 0;
        const userRole = getUserRole(userId);

        if (msg.reply_to_message) {
            const replyId = msg.reply_to_message.message_id;
            if (activeReplies.has(replyId)) {
                const replyData = activeReplies.get(replyId);
                const command = commands.get(replyData.commandName);
                if (command && typeof command.onReply === 'function') {
                    return await command.onReply({
                        bot,
                        msg,
                        Reply: replyData,
                        getLang: (key, ...args) => {
                            if (command.langs && command.langs.en && command.langs.en[key]) {
                                let str = command.langs.en[key];
                                args.forEach((val, idx) => {
                                    str = str.replace(new RegExp(`%${idx + 1}`, 'g'), val);
                                });
                                return str;
                            }
                            return key;
                        }
                    });
                }
            }
        }

        let eventHandled = false;
        if (fs.existsSync(eventsDir)) {
            const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                try {
                    const eventPath = path.join(eventsDir, file);
                    delete require.cache[require.resolve(eventPath)];
                    const event = require(eventPath);
                    if (event.onStart && typeof event.onStart === 'function') {
                        await event.onStart({ bot, msg, userRole });
                    } else if (event.execute && typeof event.execute === 'function') {
                        const handled = await event.execute(bot, msg, userRole);
                        if (handled) eventHandled = true;
                    }
                } catch (err) {
                    console.error(`Event ${file} Error:`, err.message);
                }
            }
        }

        if (eventHandled) return;

        if (config.whitelistMode && config.whitelistMode.enable) {
            const isWhitelisted = config.whitelistMode.whiteListIds && config.whitelistMode.whiteListIds.includes(String(userId));
            if (!isWhitelisted && userRole < 2) {
                return bot.sendMessage(chatId, 'এই বটটি বর্তমানে হোয়াইটলিস্ট মোডে রয়েছে। আপনার এটি ব্যবহারের পারমিশন নেই।');
            }
        }

        if (!text) return;

        const currentPrefix = config.prefix !== undefined ? config.prefix : '/';

        if (text === currentPrefix) {
            return;
        }

        if (text === '/start' || (currentPrefix && text === `${currentPrefix}start`)) {
            return bot.sendMessage(
                chatId,
                `Welcome to Telegram Bot!\n\nAll Commands: ${currentPrefix}help\nAdmin Control: ${currentPrefix}cmd`
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
                    let errorMsg = '';
                    if (requiredRole >= 2) {
                        errorMsg = getLangText('handlerEvents.onlyAdminBot2', [actualCommandName]) || `ONLY MY BOSS CAN USE THE COMMAND "${actualCommandName}"`;
                    } else {
                        errorMsg = getLangText('handlerEvents.onlyAdmin', [actualCommandName]) || `ONLY ADMINISTRATORS CAN USE THE COMMAND "${actualCommandName}"`;
                    }
                    return bot.sendMessage(chatId, errorMsg);
                }

                try {
                    const execFunc = command.execute || command.onStart;
                    return await execFunc({
                        bot,
                        msg,
                        args,
                        role: userRole,
                        prefix: currentPrefix,
                        commandName: actualCommandName,
                        getLang: (key, ...placeholders) => {
                            if (command.langs && command.langs.en && command.langs.en[key]) {
                                let str = command.langs.en[key];
                                placeholders.forEach((val, idx) => {
                                    str = str.replace(new RegExp(`%${idx + 1}`, 'g'), val);
                                });
                                return str;
                            }
                            return key;
                        },
                        usersData: {
                            getName: async (uid) => {
                                try {
                                    const chatMember = await bot.getChatMember(chatId, uid);
                                    return chatMember.user.first_name || "User";
                                } catch {
                                    return "User";
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error executing ${actualCommandName}:`, error);
                    return bot.sendMessage(chatId, 'কমান্ডটি রান করতে সমস্যা হয়েছে!');
                }
            } else {
                let notFoundMsg = getLangText('handlerEvents.commandNotFound', [inputCommand, currentPrefix]);
                if (!notFoundMsg) {
                    notFoundMsg = `COMMAND "${inputCommand}" DOES NOT EXIST, TYPE ${currentPrefix}help TO SEE ALL AVAILABLE COMMANDS`;
                }
                return bot.sendMessage(chatId, notFoundMsg);
            }
        }
    } catch (globalMsgErr) {
        console.error("Global Message Processing Error:", globalMsgErr.message);
    }
});

console.log('Telegram Bot Engine Active and Ready!');
