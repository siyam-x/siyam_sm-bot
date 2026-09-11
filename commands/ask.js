module.exports = {
  name: "ask",
  aliases: ["question"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "ai",
  shortDescription: "🤖 যেকোনো প্রশ্ন করুন",
  longDescription: "Ask any question to the bot.",
  guide: "{pn} <আপনার প্রশ্ন>",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = Array.isArray(argsText) ? argsText.join(" ") : argsText;

    if (!query) {
      return bot.sendMessage(chatId, "⚠️ কোনো প্রশ্ন লিখুন, যেমন: `/ask বাংলাদেশের রাজধানী কি?`", {
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });
    }

    return bot.sendMessage(chatId, `🤖 *প্রশ্ন:* ${query}\n💡 *উত্তর:* এটি একটি গুরুত্বপূর্ণ প্রশ্ন!`, {
      parse_mode: "Markdown",
      reply_to_message_id: messageId
    });
  }
};
