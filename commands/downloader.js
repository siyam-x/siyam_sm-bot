const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "downloader";

module.exports = {
    name: COMMAND_NAME,
    version: "2.0.0",
    author: AUTHOR,
    category: "media",
    description: "Auto-download videos from Facebook, TikTok, Instagram & YouTube",

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

        const url = linkMatches[0];

        // ১. লোডিং মেসেজ পাঠানো
        const loadingMsg = await bot.sendMessage(
            chatId, 
            "⏳ *ভিডিওটি প্রসেস করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...*", 
            { parse_mode: 'Markdown', reply_to_message_id: messageId }
        );

        try {
            // মাল্টি-প্ল্যাটফর্ম ভিডিও ডাউনলোডার এপিআই
            const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            let videoUrl = null;
            let title = "Downloaded Video";

            if (data && data.video && data.video.noWatermark) {
                videoUrl = data.video.noWatermark;
                title = data.title || title;
            } else if (data && data.url) {
                videoUrl = data.url;
            }

            // ব্যাকআপ এপিআই (প্রথমটি ব্যর্থ হলে এটি কাজ করবে)
            if (!videoUrl) {
                const backupApi = `https://ruhend-api.onrender.com/api/alldown?url=${encodeURIComponent(url)}`;
                const backupRes = await axios.get(backupApi);
                if (backupRes.data && backupRes.data.data && backupRes.data.data.high) {
                    videoUrl = backupRes.data.data.high;
                    title = backupRes.data.data.title || title;
                }
            }

            if (!videoUrl) {
                throw new Error("Video stream URL not found.");
            }

            // ২. ডাউনলোড সফল হলে লোডিং মেসেজ ডিলিট করে ভিডিও পাঠানো
            await bot.deleteMessage(chatId, loadingMsg.message_id);

            const caption = 
`📥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃
━━━━━━━━━━━━━━━
🎬 𝐓𝐈𝐓𝐋𝐄: ${title}
━━━━━━━━━━━━━━━
🦋 ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

            await bot.sendVideo(chatId, videoUrl, {
                caption: caption,
                reply_to_message_id: messageId,
                parse_mode: 'Markdown'
            });

        } catch (err) {
            console.error("Download Error:", err.message);

            // ৩. ব্যর্থ হলে লোডিং মেসেজ এডিট করে ফেল মেসেজ দেওয়া
            await bot.editMessageText(
                "❌ *ভিডিওটি ডাউনলোড করা সম্ভব হয়নি!*\n\n👉 লিংকটি সঠিক কিনা নিশ্চিত করুন অথবা প্রাইভেট ভিডিও কিনা পরীক্ষা করুন।", 
                {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'Markdown'
                }
            );
        }
    }
};
