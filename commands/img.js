const axios = require('axios');

module.exports = {
    name: 'img',
    version: '1.0.0',
    author: 'Siyam Hasan',
    description: 'AI Image Generator',
    execute: async (bot, msg, prompt) => {
        const chatId = msg.chat.id;

        if (!prompt) {
            return bot.sendMessage(chatId, '⚠️ ছবির বিবরণ দিন।\nউদাহরণ: `/img a red sports car on a futuristic city street`', { parse_mode: 'Markdown' });
        }

        const statusMsg = await bot.sendMessage(chatId, '🎨 ছবি জেনারেট করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');

        try {
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;

            // Axios দিয়ে ছবি Buffer হিসেবে ডাউনলোড করা হচ্ছে
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'utf-8');

            // Telegram-এ Buffer পাঠানো হচ্ছে
            await bot.sendPhoto(chatId, imageBuffer, {
                caption: `🎨 *Generated Image:* "${prompt}"\n👑 *Author:* Siyam Hasan`,
                parse_mode: 'Markdown'
            });

            // মেসেজ ডিলিট করা
            await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
        } catch (error) {
            console.error('Image Error:', error.message);
            
            // ডিলিট করার সময় কোনো এরর এড়াতে try-catch হ্যান্ডলিং
            await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
            
            bot.sendMessage(chatId, '❌ ছবি তৈরি করতে সমস্যা হয়েছে!');
        }
    }
};
