const axios = require("axios");
const config = require("../config");

let mediaIndex = 0;

module.exports = {
  name: "info",
  aliases: ["owner", "developer", "about"],
  version: "4.5.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  shortDescription: "Owner & Bot full info with media",
  longDescription: "Displays detailed information about the bot owner with media attachments.",
  guide: "{pn}",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(chatId, "⏳ তথ্য সংগ্রহ করা হচ্ছে...", { reply_to_message_id: messageId });
    } catch (e) {
      console.error("Loading Message Error:", e.message);
    }

    try {
      const now = new Date();
      const dateOptions = { timeZone: "Asia/Dhaka", year: "numeric", month: "long", day: "numeric" };
      const timeOptions = { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
      
      const date = now.toLocaleDateString("en-US", dateOptions);
      const time = now.toLocaleTimeString("en-US", timeOptions);

      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const groupName = msg.chat.title || msg.chat.first_name || "বলবো না 😁 সিয়াম বস কে প্রেম করাই দাও নাই😴";

      let botUsername = config.botUsername || "SiyamSM_2026Bot";
      try {
        const me = await bot.getMe();
        botUsername = me.username;
      } catch (e) {}

      const mediaFiles = [
        "https://files.catbox.moe/8f2fc5.mp4",
        "https://files.catbox.moe/3aikdw.mp4"
      ];

      const captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
» 🎂 𝗔𝗚𝗘: 18 𝟏7+
» 🚻 𝗚𝗘𝗡𝗗𝗘𝗥: 𝐌𝐀𝐋𝐄
» ☪ 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡: 𝐈𝐒𝐋𝐀𝐌
───────────────
» 🏠 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: 𝐊𝐈𝐒𝐇𝐎𝐑𝐄𝐆𝐀𝐍𝐉 → 𝐁𝐀𝐍𝐆𝐋𝐀𝐃𝐄𝐒𝐇
» 🏫 𝗦𝗖𝗛𝗢𝗢𝗟: 𝐌 𝐀 𝐌𝐀𝐍𝐍𝐀𝐍 𝐌𝐀𝐍𝐈𝐊 𝐇𝐈𝐆𝐇 𝐒𝐂𝐇𝐎𝐎𝐋
» 💔 𝗥𝗘🇱𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣: 𝐒𝐈𝐍𝐆🇱🇪
» 🛠 𝗪𝗢𝗥𝗞: 𝐍𝐎𝐓 𝐖𝐎𝐑𝐊𝐈𝐍𝐆
» 🕒 𝗧𝗜𝗠𝗘: ${time}
» 📅 𝗗𝗔𝗧𝗘: ${date}
───────────────
» 👑 𝗚𝗥𝗢𝗨𝗣: ${groupName}
» ⚙️ 𝗣𝗥🇪𝗙𝗜𝗫: ${config.prefix || "/"}
» 💬 𝗛🇪🇱𝗣: /start
» ⏳ 𝗨𝗣𝗧𝗜𝗠🇪: ${uptimeString}
───────────────
» 🌐 𝗙𝗔🇨🇪𝗕𝗢𝗢🇰: https://www.facebook.com/profile.php?id=61591371186179
» 💬 𝗧𝗜🇰𝗧𝗢🇰: siyam0132525
» 📞 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣: +8801789138157`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
            { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝗥", url: `https://t.me/${config.ownerUsername || "ri_siyam"}` }
          ]
        ]
      };

      if (mediaFiles.length > 0) {
        const currentMedia = mediaFiles[mediaIndex % mediaFiles.length];
        mediaIndex = (mediaIndex + 1) % mediaFiles.length;

        await bot.sendVideo(chatId, currentMedia, {
          caption: captionText,
          reply_to_message_id: messageId,
          reply_markup: replyMarkup
        });
      } else {
        await bot.sendMessage(chatId, captionText, {
          reply_to_message_id: messageId,
          reply_markup: replyMarkup
        });
      }

      if (loadingMsg) {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      }

    } catch (err) {
      console.error("Info Command Error:", err.message);

      if (loadingMsg) {
        try {
          await bot.deleteMessage(chatId, loadingMsg.message_id);
        } catch (e) {}
      }

      return bot.sendMessage(
        chatId,
        `❌ তথ্য লোড করতে সমস্যা হয়েছে!\nএরর: ${err.message}`,
        { reply_to_message_id: messageId }
      );
    }
  }
};
