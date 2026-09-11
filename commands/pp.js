const config = require("../config");

module.exports = {
  name: "pp",
  aliases: ["profile", "avatar", "dp", "pfp"],
  version: "1.1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "utility",
  shortDescription: "Get user profile picture",
  longDescription: "Fetches and displays the profile picture of yourself or the replied user.",
  guide: "{pn}",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const botUsername = config.botUsername || "SiyamSM_2026Bot";
    const ownerUsername = config.ownerUsername || "ri_siyam";
    const supportGroup = config.supportGroup || "ri_siyam";

    try {
      let targetUser = msg.from;

      if (msg.reply_to_message) {
        targetUser = msg.reply_to_message.from;
      }

      const userId = targetUser.id;
      const firstName = targetUser.first_name || "User";

      const userProfilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      const captionText = 
`👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📸 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘
👤 𝐍𝐚𝐦𝐞: ${firstName}
🆔 𝐔𝐈𝐃: \`${userId}\`
🌸 আপনার পিকচার!
───────────────
🧚‍♀️𝐍𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `[https://t.me/$](https://t.me/$){botUsername}?startgroup=true` },
            { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `[https://t.me/$](https://t.me/$){ownerUsername}` },
            { text: "🤝 𝐒𝐔𝐏𝐏𝐎𝐑𝐓", url: `[https://t.me/$](https://t.me/$){supportGroup}` }
          ]
        ]
      };

      if (userProfilePhotos.total_count > 0) {
        const photos = userProfilePhotos.photos[0];
        const fileId = photos[photos.length - 1].file_id;

        return await bot.sendPhoto(chatId, fileId, {
          caption: captionText,
          parse_mode: "Markdown",
          reply_to_message_id: messageId,
          reply_markup: replyMarkup
        });
      } else {
        return await bot.sendMessage(
          chatId, 
          captionText + "\n\n⚠️ ইউজারের কোনো প্রোফাইল পিকচার পাওয়া যায়নি!", 
          {
            parse_mode: "Markdown",
            reply_to_message_id: messageId,
            reply_markup: replyMarkup
          }
        );
      }

    } catch (error) {
      console.error("PP Command Error:", error);
      return bot.sendMessage(chatId, "❌ প্রোফাইল পিকচার লোড করতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
    }
  }
};
