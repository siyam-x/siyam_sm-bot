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

            await bot.sendPhoto(chatId, imageUrl, {
                caption: `🎨 *Generated Image:* "${prompt}"\n👑 *Author:* Siyam Hasan`,
                parse_mode: 'Markdown'
            });

            await bot.deleteMessage(chatId, statusMsg.message_id);
        } catch (error) {
            console.error('Image Error:', error.message);
            await bot.deleteMessage(chatId, statusMsg.message_id);
            bot.sendMessage(chatId, '❌ ছবি তৈরি করতে সমস্যা হয়েছে!');
        }
    }
};
