module.exports = {
  name: "owner",
  aliases: ["admin", "creator", "অনার"],
  version: "1.0.0",
  author: "SIYAM-HASAN",
  category: "private",
  description: "Displays owner profile and personal information",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const ownerInfo = 
      `👑 *BOT OWNER PROFILE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *নাম:* SIYAM HASAN\n` +
      `💼 *রোল:* Lead Developer & Owner\n` +
      `🌐 *টেলিগ্রাম:* @siyam_hasan\n` +
      `📌 *স্ট্যাটাস:* Active & Building\n\n` +
      `⚙️ *প্রাইভেট কন্ট্রোল প্যানেল একটিভ।*`;

    try {
      await bot.sendMessage(chatId, ownerInfo, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });
    } catch (err) {
      console.error("Owner Command Error:", err.message);
    }
  }
};
