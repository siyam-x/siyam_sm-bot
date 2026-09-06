const axios = require('axios');

module.exports = {
    name: 'downloader',
    description: 'Auto Universal Video Downloader',
    execute: async (bot, msg, url) => {
        const chatId = msg.chat.id;
        const statusMsg = await bot.sendMessage(chatId, '📥 ভিডিওটি প্রসেস করা হচ্ছে, কিছুক্ষণ অপেক্ষা করুন...');

        try {
            const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);

            let videoUrl = null;

            if (response.data && response.data.video) {
                videoUrl = response.data.video.noWatermark || response.data.video.watermark;
            } else if (response.data && response.data.url) {
                videoUrl = response.data.url;
            }

            if (!videoUrl) {
                const altApi = `https://m.phimhot.pro/api/fb?url=${encodeURIComponent(url)}`;
                const altRes = await axios.get(altApi);
                if (altRes.data && altRes.data.hd) videoUrl = altRes.data.hd;
                else if (altRes.data && altRes.data.sd) videoUrl = altRes.data.sd;
            }

            if (!videoUrl) {
                await bot.deleteMessage(chatId, statusMsg.message_id);
                return bot.sendMessage(chatId, '❌ ভিডিওটি ডাউনলোড করা সম্ভব হয়নি। লিংকটি প্রাইভেট অথবা সাপোর্ট করছে না।');
            }

            await bot.sendVideo(chatId, videoUrl, {
                caption: '✅ *Here is your Downloaded Video!*',
                parse_mode: 'Markdown'
            });

            await bot.deleteMessage(chatId, statusMsg.message_id);
        } catch (error) {
            console.error('Download Error:', error.message);
            await bot.deleteMessage(chatId, statusMsg.message_id);
            bot.sendMessage(chatId, '❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে!');
        }
    }
};
