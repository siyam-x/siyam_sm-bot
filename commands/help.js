const config = require("../config");

module.exports = {
    name: "help",
    aliases: ["cmd", "menu"],
    role: 0,
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // ⚙️ পরিবর্তন করুন: আপনার বটের Username এবং Owner এর Username দিন (@ ছাড়া)
        const BOT_USERNAME = "YourBotUsername"; 
        const OWNER_USERNAME = "YourOwnerUsername"; 

        const prefix = config.prefix || "/";
        const allCommands = bot.commands;

        // যেকোনো নির্দিষ্ট কমান্ড সম্পর্কে জানতে (যেমন: /help ping)
        if (args.length > 0) {
            const cmdName = args[0].toLowerCase();
            const command = allCommands.get(cmdName) || [...allCommands.values()].find(c => c.aliases?.includes(cmdName));

            if (!command) {
                return bot.sendMessage(chatId, `❌ *'${cmdName}' নামে কোনো কমান্ড পাওয়া যায়নি!*`, { parse_mode: "Markdown" });
            }

            const infoMsg = 
`┏━━━━━━━━━━━━━┓
 🧩 𝐂𝐌𝐃 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 ✦ 𝐍𝐚𝐦𝐞     : \`${command.name}\`
 ✦ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬  : \`${command.aliases ? command.aliases.join(", ") : "None"}\`
 ✦ 𝐑𝐨𝐥𝐞     : \`${command.role || 0}\`
━━━━━━━━━━━━━━━
👉 চ্যাটে পেস্ট করতে কমান্ডের ওপর ট্যাপ করুন: \`${prefix}${command.name}\``;

            return bot.sendMessage(chatId, infoMsg, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
                            { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
                        ]
                    ]
                }
            });
        }

        // সকল কমান্ডের তালিকা দেখানো
        let cmdListText = "";
        allCommands.forEach((cmd) => {
            cmdListText += `    ➥ \`${prefix}${cmd.name}\`\n`;
        });

        const helpMessage = 
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 🔧 𝐏𝐫𝐞𝐟𝐢𝐱: \`${prefix}\` | 📊 𝐓𝐨𝐭𝐚𝐥: ${allCommands.size} 𝐜𝐦𝐝𝐬
━━━━━━━━━━━━━━━

📁 『 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 』
${cmdListText}
━━━━━━━━━━━━━━━
✨ কোনো কমান্ডে চাপ দিলে সরাসরি চ্যাট বক্সে চলে যাবে!`;

        return bot.sendMessage(chatId, helpMessage, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
                        { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
                    ]
                ]
            }
        });
    }
};
