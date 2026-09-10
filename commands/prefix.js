const config = require("../config");

module.exports = {
    name: "prefix",
    aliases: ["pfx"],
    role: 0,
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // ⚙️ পরিবর্তন করুন: আপনার বটের Username এবং Owner এর Username দিন (@ ছাড়া)
        const BOT_USERNAME = "YourBotUsername"; 
        const OWNER_USERNAME = "YourOwnerUsername"; 

        const currentPrefix = config.prefix || "/";
        const totalCommands = bot.commands ? bot.commands.size : 0;

        const responseText = 
`╭👑 𝐏𝐑𝐄𝐅𝐈𝐗 𝐏𝐀𝐍𝐄𝐋 👑 ╮
💬 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐏𝐫𝐞𝐟𝐢𝐱 ➜ [ \`${currentPrefix}\` ]
📊 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ➜ ${totalCommands}
⚡ 𝐒𝐭𝐚𝐭𝐮𝐬 ➜ 𝐎𝐍𝐋𝐈𝐍𝐄
〔 💎𝐍𝐈𝐉𝐇𝐔𝐌 𝐁𝐎𝐓💎 〕

👉 প্রিপিক্স পরিবর্তন করতে \`config.js\` ফাইলের \`prefix\` এডিট করুন।`;

        return bot.sendMessage(chatId, responseText, {
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
