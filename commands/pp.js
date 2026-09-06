module.exports = {
    name: 'pp',
    version: '1.0.0',
    author: 'Siyam Hasan',
    description: 'Get User Profile Picture',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // রিপ্লাই দেওয়া ইউজার থাকলে তার ID, না হয় যে কমান্ড দিচ্ছে তার ID
        let targetUser = msg.from;
        if (msg.reply_to_message) {
            targetUser = msg.reply_to_message.from;
        }

        try {
            // ইউজারের প্রোফাইল ফটোজ ফেচ করা
            const userPhotos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 });

            if (!userPhotos || userPhotos.total_count === 0) {
                return bot.sendMessage(
                    chatId,
                    `❌ *${targetUser.first_name}* এর কোনো প্রোফাইল পিকচার সেট করা নেই অথবা প্রাইভেসি দেওয়া আছে।`,
                    { parse_mode: 'Markdown' }
                );
            }

            // সবচেয়ে হাই-রেজুলেশনের ছবি সিলেক্ট করা
            const photoArray = userPhotos.photos[0];
            const highestResPhoto = photoArray[photoArray.length - 1].file_id;

            const name = targetUser.first_name + (targetUser.last_name ? ` ${targetUser.last_name}` : '');
            const username = targetUser.username ? `@${targetUser.username}` : 'নাই';

            await bot.sendPhoto(chatId, highestResPhoto, {
                caption: `👤 *Profile Picture Details*\n\n` +
                         `📛 *Name:* ${name}\n` +
                         `🆔 *User ID:* \`${targetUser.id}\`\n` +
                         `🔗 *Username:* ${username}\n\n` +
                         `👑 *Author:* Siyam Hasan`,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('PP Error:', error.message);
            bot.sendMessage(chatId, '❌ প্রোফাইল পিকচার নিয়ে আসতে সমস্যা হয়েছে!');
        }
    }
};
