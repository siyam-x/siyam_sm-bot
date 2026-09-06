const axios = require("axios");

module.exports = {
    name: 'help',
    version: '6.3.0',
    author: 'EryXenX & Siyam',
    description: 'Show all available bot commands in stylish UI',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        const fancyFont = (str) =>
            str.replace(/[A-Za-z]/g, (c) => {
                const map = {
                    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
                    I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
                    Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"🇺",V:"𝐕",W:"𝐖",X:"𝐗",
                    Y:"𝐘",Z:"𝐙",
                    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",
                    i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",
                    q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"🇺",v:"𝐯",w:"𝐰",x:"𝐱",
                    y:"𝐲",z:"𝐳"
                };
                return map[c] || c;
            });

        const categoryFont = (str) =>
            str.split("").map(c => {
                const map = {
                    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
                    I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
                    Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"🇺",V:"𝐕",W:"𝐖",X:"𝐗",
                    Y:"𝐘",Z:"𝐙"
                };
                return map[c] || c;
            }).join("");

        const gifURLs = [
            "https://i.imgur.com/Xw6JTfn.gif",
            "https://i.imgur.com/mW0yjZb.gif",
            "https://i.imgur.com/KQBcxOV.gif"
        ];
        const randomGif = gifURLs[Math.floor(Math.random() * gifURLs.length)];

        // ১. নির্দিষ্ট কোনো কমান্ডের বিস্তারিত ইনফো দেখতে
        if (args && args.trim().length > 0) {
            const searchCmd = args.trim().toLowerCase();
            const commands = bot.commands; 

            let cmd = null;
            if (commands && commands.has(searchCmd)) {
                cmd = commands.get(searchCmd);
            }

            if (!cmd) {
                return bot.sendMessage(
                    chatId,
                    `❌ *${fancyFont(`Command '${searchCmd}' not found!`)}*\n➤ Type \`/help\` to see full list`,
                    { parse_mode: 'Markdown' }
                );
            }

            const infoMsg =
`┏━━━━━━━━━━━━━┓
 🧩 𝐂𝐌𝐃 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 ✦ Name     : ${cmd.name || searchCmd}
 ✦ Version  : v${cmd.version || "1.0"}
 ✦ Author   : ${cmd.author || "Siyam Hasan"}
 ✦ Usage    : /${cmd.name || searchCmd}
━━━━━━━━━━━━━━━
 📝 ${cmd.description || "No description provided."}`;

            try {
                return await bot.sendAnimation(chatId, randomGif, { caption: infoMsg });
            } catch {
                return await bot.sendMessage(chatId, infoMsg);
            }
        }

        // ২. সব কমান্ডের তালিকা ক্যাটাগরি অনুযায়ী দেখানো
        const categoryEmojis = {
            system: "⚙️",
            economy: "💰",
            moderation: "🛡️",
            fun: "🎮",
            chat: "💬",
            media: "🎬",
            others: "📁"
        };

        const categories = {};
        if (bot.commands && bot.commands.size > 0) {
            for (const [name, cmd] of bot.commands) {
                const cat = (cmd.category || "others").toLowerCase();
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(name);
            }
        } else {
            // যদি bot.commands সেট না থাকে তবে ডিফল্ট কমান্ডগুলো দেখাবে
            categories["system"] = ["help", "info", "pp"];
            categories["chat"] = ["ai", "baby"];
            categories["media"] = ["img", "downloader"];
        }

        const totalCmds = bot.commands ? bot.commands.size : 7;

        let helpText =
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 🔧 Prefix: / | 📊 Total: ${totalCmds} cmds
━━━━━━━━━━━━━━━\n`;

        for (const cat of Object.keys(categories)) {
            const emoji = categoryEmojis[cat] || "📁";
            helpText += `\n${emoji} 『 ${categoryFont(cat.toUpperCase())} 』 ✦ ${categories[cat].length}\n`;
            helpText += categories[cat].sort().map(c => `    ➥ /${fancyFont(c)}`).join("\n") + "\n";
        }

        helpText += `\n━━━━━━━━━━━━━━━\n✨ Type \`/help <command_name>\` for info`;

        try {
            await bot.sendAnimation(chatId, randomGif, {
                caption: helpText
            });
        } catch (err) {
            console.error("Help Command GIF Error:", err.message);
            await bot.sendMessage(chatId, helpText);
        }
    }
};
