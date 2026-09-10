module.exports = {
    name: "pp",
    aliases: ["profile", "avatar"],
    role: 0,
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        
        // ⚙️ পরিবর্তন করুন: আপনার বটের Username এবং Owner এর Username দিন (@ ছাড়া)
        const BOT_USERNAME = "YourBotUsername"; 
        const OWNER_USERNAME = "YourOwnerUsername"; 

        try {
            let targetUser = msg.from;

            // ১. যদি কোনো মেসেজে রিপ্লাই দেওয়া থাকে
            if (msg.reply_to_message) {
                targetUser = msg.reply_to_message.from;
            }

            const userId = targetUser.id;
            const firstName = targetUser.first_name || "User";

            // প্রোফাইল পিকচার সংগ্রহ করা
            const userProfilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

            const captionText = 
`👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📸 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘
👤 𝐍𝐚𝐦𝐞: ${firstName}
🆔 𝐔𝐈𝐃: \`${userId}\`
🌸 আপনার পিকচার!
───────────────
🧚‍♀️𝐍𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

            const replyMarkup = {
                inline_keyboard: [
                    [
                        { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
                        { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
                    ]
                ]
            };

            if (userProfilePhotos.total_count > 0) {
                const fileId = userProfilePhotos.photos[0][2]?.file_id || userProfilePhotos.photos[0][0].file_id;
                return await bot.sendPhoto(chatId, fileId, {
                    caption: captionText,
                    parse_mode: "Markdown",
                    reply_markup: replyMarkup
                });
            } else {
                return await bot.sendMessage(chatId, captionText + "\n\n⚠️ *ইউজারের কোনো প্রোফাইল পিকচার পাওয়া যায়নি!*", {
                    parse_mode: "Markdown",
                    reply_markup: replyMarkup
                });
            }

        } catch (error) {
            console.error("PP Command Error:", error);
            return bot.sendMessage(chatId, "❌ প্রোফাইল পিকচার আনতে কোনো সমস্যা হয়েছে!");
        }
    }
};
