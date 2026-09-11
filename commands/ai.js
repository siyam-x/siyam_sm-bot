const axios = require("axios");

const AUTHOR = "Siyam Hasan";
const COMMAND_NAME = "ai";

const META_AI_GEM_ID = "ba0fbe0d-976e-493a-afdb-6d8469e53df0";
const META_AI_ENDPOINT = `https://nxtai.zipohostbd.workers.dev/api/use?gem=${META_AI_GEM_ID}`;
const META_AI_KEY = "nxt_3a454c41e6a84aeead28d1fb4aec87a4";

const BOT_USERNAME = "YourBotUsername"; 
const OWNER_USERNAME = "YourOwnerUsername";

module.exports = {
  name: COMMAND_NAME,
  aliases: ["meta", "chat"],
  version: "1.0.0",
  author: AUTHOR,
  category: "ai",
  description: "Chat with Meta AI Assistant",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prompt = Array.isArray(argsText) ? argsText.join(" ").trim() : (argsText ? argsText.trim() : "");

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    if (!prompt) {
      return bot.sendMessage(
        chatId,
        "👉 *ব্যবহার:* `/ai আপনার প্রশ্ন`",
        { parse_mode: "Markdown", reply_to_message_id: messageId, reply_markup: replyMarkup }
      );
    }

    const loadingMsg = await bot.sendMessage(
      chatId,
      "💭 *চিন্তা করা হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      const res = await axios.post(
        META_AI_ENDPOINT,
        { api_key: META_AI_KEY, message: prompt },
        { headers: { "Content-Type": "application/json" }, timeout: 30000 }
      );

      const replyText = res.data?.response || res.data?.message || res.data?.text || "কোনো উত্তর পাওয়া যায়নি।";

      await bot.editMessageText(
        `🤖 *Meta AI:* \n\n${replyText}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );

    } catch (err) {
      console.error("AI Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* AI এখন উত্তর দিতে পারছে না। পরে চেষ্টা করুন।`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );
    }
  }
};
