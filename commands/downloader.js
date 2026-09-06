const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "downloader";

module.exports = {
    name: COMMAND_NAME,
    version: "1.3",
    author: AUTHOR,
    category: "media",
    description: "Auto-download & send videos silently when link is sent",

    execute: async (bot, msg, text) => {
        if (
            module.exports.author !== AUTHOR ||
            module.exports.name !== COMMAND_NAME
        ) {
            return;
        }

        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const messageText = text || msg.text || "";

        const linkMatches = messageText.match(/(https?:\/\/[^\s]+)/g);
        if (!linkMatches || linkMatches.length === 0) return;

        const uniqueLinks = [...new Set(linkMatches)];

        try {
            await bot.setMessageReaction(chatId, messageId, { reaction: "💋" });
        } catch (e) {
            // রিয়্যাকশন না দিতে পারলে কাজ থমকে যাবে না
        }

        let successCount = 0;
        let failCount = 0;

        for (const url of uniqueLinks) {
            try {
                const { title, filePath } = await downloadVideo(url);
                if (!filePath || !fs.existsSync(filePath)) throw new Error("File download failed");

                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 49) { // টেলিগ্রামের সাধারণ ফাইল লিমিট ৫০ এমবি
                    fs.unlinkSync(filePath);
                    failCount++;
                    continue;
                }

                const caption = 
`📥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃
━━━━━━━━━━━━━━━
🎬 𝐓𝐈𝐓𝐋𝐄 : ${title || "Video File"}
📦 𝐒𝐈𝐙𝐄 : ${fileSizeInMB.toFixed(2)} 𝐌𝐁
━━━━━━━━━━━━━━━
🦋 ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

                await bot.sendVideo(chatId, filePath, {
                    caption: caption,
                    reply_to_message_id: messageId
                });

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                successCount++;

            } catch (err) {
                console.error("Download Error:", err.message);
                failCount++;
            }
        }

        const finalReaction =
            successCount > 0 && failCount === 0 ? "🎉" :
            successCount > 0 ? "⚠️" : "❌";

        try {
            await bot.setMessageReaction(chatId, messageId, { reaction: finalReaction });
        } catch (e) {}
    }
};
