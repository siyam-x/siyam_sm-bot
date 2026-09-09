module.exports = {
    name: 'userinfo',
    version: '1.0.0',
    author: 'Siyam Hasan',
    description: 'Get user account information and profile picture',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const targetUser = msg.reply_to_message ? msg.reply_to_message.from : msg.from;

        try {
            const userPhotos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 });

            const fullName = `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim();
            const username = targetUser.username ? `@${targetUser.username}` : 'None';
            const isBot = targetUser.is_bot ? 'Yes 🤖' : 'No 👤';

            const captionText = `👤 *USER INFORMATION*\n\n` +
                `📛 *Name:* ${fullName}\n` +
                `🆔 *User ID:* \`${targetUser.id}\`\n` +
                `🔗 *Username:* ${username}\n` +
                `🤖 *Bot Account:* ${isBot}`;

            // বাটন সেট করার অপশন
            const options = {
                caption: captionText,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '➕ Add Me To Group 🚀', url: `https://t.me/${(await bot.getMe()).username}?startgroup=true` },
                            { text: '📢 Channel', url: 'https://t.me/your_channel_username' }
                        ],
                        [
                            { text: '👑 Contact Owner', url: 'https://t.me/your_telegram_username' }
                        ]
                    ]
                }
            };

            if (userPhotos.total_count > 0) {
                const photoFileId = userPhotos.photos[0][0].file_id;
                await bot.sendPhoto(chatId, photoFileId, options);
            } else {
                await bot.sendMessage(chatId, captionText, {
                    parse_mode: 'Markdown',
                    reply_markup: options.reply_markup
                });
            }

        } catch (error) {
            console.error('Userinfo Error:', error.message);
            bot.sendMessage(chatId, '❌ Failed to collect information!');
        }
    }
};
