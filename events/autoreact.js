const emojis = ["❤️", "👍", "🔥", "❤️‍🔥", "😍", "🎉", "👏", "⚡", "✨", "💯", "🫡", "😎", "🤩", "🚀"];

module.exports = {
  name: "autoreact",
  version: "1.0.0",
  author: "SIYAM-HASAN",
  category: "events",
  description: "Automatically reacts to every message with a random emoji",

  execute: async (bot, msg) => {
    if (!msg || !msg.chat || !msg.message_id) return;

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    try {
      await bot.setMessageReaction(chatId, messageId, {
        reaction: [{ type: "emoji", emoji: randomEmoji }],
        is_big: false
      });
    } catch (err) {
      console.error("AutoReact Error:", err.message);
    }
  }
};
