const axios = require("axios");

let mediaIndex = 0;

module.exports = {
    name: 'info',
    version: '4.4.0',
    author: '𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍',
    description: 'Owner & Bot full info with media',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // সময় এবং তারিখ হিসাব করা
        const now = new Date();
        const dateOptions = { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        
        const date = now.toLocaleDateString('en-US', dateOptions);
        const time = now.toLocaleTimeString('en-US', timeOptions);

        // আপটাইম (Uptime) হিসাব করা
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // গ্রুপের নাম বা চ্যাটের নাম
        const groupName = msg.chat.title || msg.chat.first_name || "বলবো না 😁 সিয়াম বস কে প্রেম করাই দাও নাই😴";

        const mediaFiles = [
            "https://files.catbox.moe/8f2fc5.mp4",
            "https://files.catbox.moe/3aikdw.mp4"
        ];

        const captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${(await bot.getMe()).username}
» 🎂 𝗔𝗚𝗘: 18 𝟏7+
» 🚻 𝗚𝗘𝗡𝗗𝗘𝗥: 𝐌𝐀𝐋𝐄
» ☪ 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡: 𝐈𝐒𝐋𝐀𝐌
───────────────
» 🏠 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: 𝐊𝐈𝐒𝐇𝐎𝐑𝐄𝐆𝐀𝐍𝐉 → 𝐁𝐀𝐍𝐆𝐋𝐀𝐃𝐄𝐒𝐇
» 🏫 𝗦𝗖𝗛𝗢𝗢𝗟: 𝐌 𝐀 𝐌𝐀𝐍𝐍𝐀𝐍 𝐌𝐀𝐍𝐈𝐊 𝐇𝐈𝐆𝐇 𝐒𝐂𝐇𝐎𝐎𝐋
» 💔 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣: 𝐒𝐈𝐍𝐆𝐋𝐄
» 🛠 𝗪𝗢𝗥𝗞: 𝐍𝐎𝐓 𝐖𝐎𝐑𝐊𝐈𝐍𝐆
» 🕒 𝗧𝗜𝗠𝗘: ${time}
» 📅 𝗗𝗔𝗧𝗘: ${date}
───────────────
» 👑 𝗚𝗥𝗢𝗨𝗣: ${groupName}
» ⚙️ 𝗣𝗥𝗘𝗙𝗜𝗫: /
» 💬 𝗛𝗘𝗟𝗣: /start
» ⏳ 𝗨𝗣𝗧𝗜𝗠𝗘: ${uptimeString}
───────────────
» 🌐 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/profile.php?id=61591371186179
» 💬 𝗧𝗜𝗞𝗧𝗢𝗞: siyam0132525
» 📞 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣: +8801789138157`;

        try {
            if (mediaFiles.length > 0) {
                const currentMedia = mediaFiles[mediaIndex % mediaFiles.length];
                mediaIndex = (mediaIndex + 1) % mediaFiles.length;

                // ভিডিও ও ক্যাপশন একসাথে সেন্ড করা
                await bot.sendVideo(chatId, currentMedia, {
                    caption: captionText
                });
            } else {
                await bot.sendMessage(chatId, captionText);
            }
        } catch (err) {
            console.error('Info Error:', err.message);
            // ভিডিও সেন্ড করতে সমস্যা হলে শুধুই টেক্সট পাঠাবে
            bot.sendMessage(chatId, captionText);
        }
    }
};
