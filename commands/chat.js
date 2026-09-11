module.exports = {
  name: "chat",
  aliases: ["talk"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "ai",
  shortDescription: "💬 AI-এর সাথে কথা বলুন",
  longDescription: "Chat with AI assistant.",
  guide: "{pn} <কথা বলুন>",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = Array.isArray(argsText) ? argsText.join(" ") : argsText;

    if (!query) {
      return bot.sendMessage(chatId, "⚠️ কিছু লিখুন, যেমন: `/chat কেমন আছো?`", {
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });
    }

    return bot.sendMessage(chatId, `💬 *AI উত্তর:* আমি ভালো আছি! আপনি কেমন আছেন?`, {
      parse_mode: "Markdown",
      reply_to_message_id: messageId
    });
  }
};
