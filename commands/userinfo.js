module.exports = {
    name: 'userinfo',
    version: '1.0.0',
    author: 'Siyam Hasan',
    description: 'Get user account information and profile picture',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const targetUser = msg.reply_to_message ? msg.reply_to_message.from : msg.from;

        const myButtons = {
            inline_keyboard: [
                [
                    { text: '➕ Add To Group', url: 'https://t.me/ri_siyam?startgroup=true' }
                ],
                [
                    { text: '👑 Contact Owner', url: 'https://t.me/ri_siyam' }
                ]
            ]
        };

        try {
            const userPhotos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 }).catch(() => ({ total_count: 0 }));

            const fullName = `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim();
            const username = targetUser.username ? `@${targetUser.username}` : 'None';
            const isBot = targetUser.is_bot ? 'Yes 🤖' : 'No 👤';

            const captionText = `👤 *USER INFORMATION*\n\n` +
                `📛 *Name:* ${fullName}\n` +
                `🆔 *User ID:* \`${targetUser.id}\`\n` +
                `🔗 *Username:* ${username}\n` +
                `🤖 *Bot Account:* ${isBot}`;

            if (userPhotos.total_count > 0) {
                const photoFileId = userPhotos.photos[0][0].file_id;
                await bot.sendPhoto(chatId, photoFileId, {
                    caption: captionText,
                    parse_mode: 'Markdown',
                    reply_markup: myButtons
                });
            } else {
                await bot.sendMessage(chatId, captionText, {
                    parse_mode: 'Markdown',
                    reply_markup: myButtons
                });
            }

        } catch (error) {
            console.error('Userinfo Error:', error.message);
            bot.sendMessage(chatId, '❌ Failed to collect information!', {
                reply_markup: myButtons
            });
        }
    }
};
