const config = require("../config");

module.exports = {
  config: {
    name: "uid",
    aliases: ["id", "userinfo"],
    version: "1.0.1",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "info",
    shortDescription: "Get user Telegram ID",
    longDescription: "Sends user ID and basic info cleanly.",
    guide: "/uid"
  },

  name: "uid",
  aliases: ["id", "userinfo"],
  version: "1.0.1",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "info",
  shortDescription: "Get user Telegram ID",
  longDescription: "Sends user ID and basic info cleanly.",
  guide: "/uid",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let targetUser = msg.from;
    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetUser = msg.reply_to_message.from;
    }

    const userId = targetUser.id;
    const firstName = targetUser.first_name || "User";
    const lastName = targetUser.last_name ? ` ${targetUser.last_name}` : "";
    const fullName = `${firstName}${lastName}`;
    const username = targetUser.username ? `@${targetUser.username}` : "নাই";

    const text = `
👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
🆔 *USER INFORMATION*
───────────────
👤 *নাম:* ${fullName}
🏷️ *ইউজারনেম:* ${username}
🆔 *ইউজার আইডি (UID):* \`${userId}\`
───────────────
⚡ *POWERED BY:* 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
`;

    return bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_to_message_id: messageId
    });
  }
};
