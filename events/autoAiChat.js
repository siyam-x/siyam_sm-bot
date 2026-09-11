const axios = require("axios");

const META_AI_GEM_ID = "ba0fbe0d-976e-493a-afdb-6d8469e53df0";
const META_AI_ENDPOINT = `https://nxtai.zipohostbd.workers.dev/api/use?gem=${META_AI_GEM_ID}`;
const META_AI_KEY = "nxt_3a454c41e6a84aeead28d1fb4aec87a4";

const BOT_USERNAME = "YourBotUsername"; 
const OWNER_USERNAME = "YourOwnerUsername";

module.exports = {
  name: "autoAiChat",
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text ? msg.text.trim() : "";
    const isPrivate = msg.chat.type === 'private';
    const replyToMsg = msg.reply_to_message;

    if (!text) return false;

    const isTriggerWord = /^(hi|hello|hey|বট|bot|কেমন আছো|হেই|হাই)/i.test(text);
    const isBotReply = replyToMsg && replyToMsg.from && replyToMsg.from.is_bot;

    if (!isTriggerWord && !isBotReply && !isPrivate) {
      return false;
    }

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    const loadingMsg = await bot.sendMessage(
      chatId,
      "💭 *চিন্তা করা হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      const res = await axios.post(
        META_AI_ENDPOINT,
        { api_key: META_AI_KEY, message: text },
        { headers: { "Content-Type": "application/json" }, timeout: 30000 }
      );

      const replyText = res.data?.response || res.data?.message || res.data?.text || "কোনো উত্তর পাওয়া যায়নি।";

      await bot.editMessageText(
        `🤖 *Meta AI:* \n\n${replyText}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );

      return true;

    } catch (err) {
      console.error("AI Reply Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* AI এখন উত্তর দিতে পারছে না।`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );
      return true;
    }
  }
};
