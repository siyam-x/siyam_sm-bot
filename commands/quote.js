const axios = require('axios');

module.exports = {
    name: 'quote',
    version: '1.0.0',
    author: 'Siyam Hasan',
    description: 'Generates a quote sticker/image from reply text or message',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // যে টেক্সট কোট করা হবে তা নিবে (রিপ্লাই করা মেসেজ অথবা কমান্ডের পরের টেক্সট)
        let quoteText = '';
        let targetUser = msg.from;

        if (msg.reply_to_message && msg.reply_to_message.text) {
            quoteText = msg.reply_to_message.text;
            targetUser = msg.reply_to_message.from;
        } else if (args && args.trim().length > 0) {
            quoteText = args.trim();
        } else {
            return bot.sendMessage(
                chatId, 
                '⚠️ যেকোনো মেসেজে রিপ্লাই দিন অথবা কমান্ডের সাথে লিখুন!\nউদাহরণ: `/quote Hello World`', 
                { parse_mode: 'Markdown' }
            );
        }

        const waitMsg = await bot.sendMessage(chatId, '🎨 কোট কার্ড তৈরি হচ্ছে...');

        try {
            // প্রফাইল পিকচারের URL সংগ্রাহ
            let avatarUrl = 'https://i.imgur.com/6E2f0wX.png'; // ডিফল্ট ছবি
            const userPhotos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 }).catch(() => null);
            
            if (userPhotos && userPhotos.total_count > 0) {
                const fileId = userPhotos.photos[0][0].file_id;
                const file = await bot.getFile(fileId);
                avatarUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
            }

            // Quotly API Payloads
            const payload = {
                type: 'quote',
                format: 'webp',
                backgroundColor: '#1b1429',
                messages: [
                    {
                        entities: [],
                        avatar: true,
                        from: {
                            id: targetUser.id,
                            name: targetUser.first_name + (targetUser.last_name ? ` ${targetUser.last_name}` : ''),
                            photo: { url: avatarUrl }
                        },
                        text: quoteText,
                        replyMessage: {}
                    }
                ]
            };

            // Quotly API অনুরোধ
            const response = await axios.post('https://bot.ly24.de/api/generate', payload);

            if (response.data && response.data.result && response.data.result.image) {
                const stickerBuffer = Buffer.from(response.data.result.image, 'base64');
                
                // স্টিকার হিসেবে পাঠানো
                await bot.sendSticker(chatId, stickerBuffer);
            } else {
                throw new Error('Invalid response from API');
            }

            await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
        } catch (error) {
            console.error('Quote Error:', error.message);
            await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
            bot.sendMessage(chatId, '❌ স্টিকার কোট তৈরি করতে সমস্যা হয়েছে!');
        }
    }
};
