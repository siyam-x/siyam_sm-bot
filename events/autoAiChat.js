const axios = require("axios");
const config = require("../config");

const META_AI_GEM_ID = "ba0fbe0d-976e-493a-afdb-6d8469e53df0";
const META_AI_ENDPOINT = `https://nxtai.zipohostbd.workers.dev/api/use?gem=${META_AI_GEM_ID}`;
const META_AI_KEY = "nxt_3a454c41e6a84aeead28d1fb4aec87a4";

const RANDOM_REPLIES = [
  "সিয়াম ভাই চিপায় আটকে গেছে! 😜",
  "ডাকলেন কেন ভাই? কিছু খাইতে দেবেন নাকি? 🍔🌸",
  "হুম বলো, শুনতেছি! 🎧✨",
  "আমাকে ডাকলে কিন্তু সিয়াম ভাই রাগ করবে! 😂🙈",
  "কী খবর বল? সব শান্তশিষ্ট তো? 🤖💫",
  "ডাকছো ভালো কথা, কিন্তু বেশি প্যানপ্যান করবা না! 🥱💤",
  "আরে প্রীতি শোনো! কি খবর তোমার? 🌺✨",
  "হেই! আমাকে মনে পড়লো তাহলে? 🙈💖"
];

module.exports = {
  name: "autoAiChat",
  aliases: ["ai", "botchat"],
  version: "1.0.5",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "ai",
  shortDescription: "Interactive auto AI chat system with triggers",
  longDescription: "Replies with random messages on trigger words and streams Meta AI responses when replied to.",
  guide: "{pn}",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text ? msg.text.trim() : "";
    const isPrivate = msg.chat.type === 'private';
    const replyToMsg = msg.reply_to_message;

    if (!text) return false;

    let botUsername = config.botUsername || "YourBotUsername";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    const ownerUsername = config.ownerUsername || "YourOwnerUsername";

    const isTriggerWord = /^(hi|hello|hey|বট|bot|baby|বেবি|প্রীতি|কেমন আছো|হেই|হাই)$/i.test(text);
    const isBotReply = replyToMsg && replyToMsg.from && replyToMsg.from.is_bot;

    if (!isTriggerWord && !isBotReply && !isPrivate) {
      return false;
    }

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
          { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` }
        ]
      ]
    };

    if (isTriggerWord && !isBotReply && !isPrivate) {
      const randomText = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];
      return bot.sendMessage(chatId, randomText, {
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    }

    const loadingMsg = await bot.sendMessage(
      chatId,
      "💭 এ্ঁক্ঁটু্ঁ ভা্ঁব্ঁছি্ঁ..",
      { reply_to_message_id: messageId }
    );

    try {
      const res = await axios.post(
        META_AI_ENDPOINT,
        { api_key: META_AI_KEY, message: text },
        { headers: { "Content-Type": "application/json" }, timeout: 30000 }
      );

      const replyText = res.data?.response || res.data?.message || res.data?.text || "কোনো উত্তর পাওয়া যায়নি। 😅";

      await bot.editMessageText(
        `🤖 AI উত্তর:\n\n${replyText}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, reply_markup: replyMarkup }
      );

      return true;

    } catch (err) {
      console.error("AI Reply Error:", err.message);
      await bot.editMessageText(
        "❌ সমস্যা! এখন উত্তর দিতে পারছি না, একটু পর চেষ্টা করুন। 🥺",
        { chat_id: chatId, message_id: loadingMsg.message_id, reply_markup: replyMarkup }
      );
      return true;
    }
  }
};
