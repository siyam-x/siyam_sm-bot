const axios = require("axios");
const config = require("../config");

const downloadCache = new Map();

const baseApiUrl = async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return res.data.mahmud;
  } catch (e) {
    return "https://mahmudx7-api.vercel.app";
  }
};

module.exports = {
  name: "autoDownloader",
  aliases: ["autodl", "dl"],
  version: "1.0.8",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "media",
  shortDescription: "Automatically downloads videos from TikTok, Facebook, and YouTube links with confirmation buttons",
  longDescription: "Detects video links, asks for confirmation with Done/Cancel buttons, deletes options menu on click, and sends the downloaded video.",
  guide: "{pn} <link>",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text ? msg.text.trim() : "";

    const isTiktok = /https?:\/\/(www\.|vt\.|vm\.)?tiktok\.com\/.+/i.test(text);
    const isYoutube = /https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/i.test(text);
    const isFacebook = /https?:\/\/(www\.|fb\.|facebook\.com)\/.+/i.test(text);

    if (!isTiktok && !isYoutube && !isFacebook) return false;

    let botUsername = config.botUsername || "YourBotUsername";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    const ownerUsername = config.ownerUsername || "YourOwnerUsername";

    const key = `${chatId}_${messageId}`;
    downloadCache.set(key, { text, isTiktok, isYoutube, isFacebook, messageId });

    const promptMarkup = {
      inline_keyboard: [
        [
          { text: "✅ Done", callback_data: `dl_done_${key}` },
          { text: "❌ Cancel", callback_data: `dl_cancel_${key}` }
        ],
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` }
        ]
      ]
    };

    await bot.sendMessage(
      chatId,
      "📥 *আপনি একটি ভিডিও লিংক পাঠিয়েছেন!*\n\nডাউনলোড শুরু করতে **Done** অথবা বাতিল করতে **Cancel** বাটনে চাপ দিন:",
      { parse_mode: "Markdown", reply_to_message_id: messageId, reply_markup: promptMarkup }
    );

    return true;
  },

  handleCallback: async (bot, query) => {
    const data = query.data;
    if (!data || (!data.startsWith("dl_done_") && !data.startsWith("dl_cancel_"))) return;

    const chatId = query.message.chat.id;

    if (data.startsWith("dl_cancel_")) {
      await bot.answerCallbackQuery(query.id, { text: "❌ ডাউনলোড বাতিল করা হয়েছে।" });
      try {
        await bot.deleteMessage(chatId, query.message.message_id);
      } catch (e) {}
      return;
    }

    const key = data.replace("dl_done_", "");
    const cacheData = downloadCache.get(key);

    if (!cacheData) {
      return bot.answerCallbackQuery(query.id, { text: "⚠️ লিংকটির মেয়াদ শেষ হয়ে গেছে! আবার পাঠাবে।", show_alert: true });
    }

    await bot.answerCallbackQuery(query.id, { text: "⏳ প্রসেসিং শুরু হচ্ছে..." });

    try {
      await bot.deleteMessage(chatId, query.message.message_id);
    } catch (e) {}

    let botUsername = config.botUsername || "YourBotUsername";
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {}

    const ownerUsername = config.ownerUsername || "YourOwnerUsername";

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` }
        ]
      ]
    };

    const loadingMsg = await bot.sendMessage(
      chatId,
      "🔎 *ভিডিও প্রসেস ও ডাউনলোড করা হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: cacheData.messageId }
    );

    try {
      const apiBase = await baseApiUrl();
      let videoUrl = "";
      let title = "Video Downloaded";

      if (cacheData.isTiktok) {
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cacheData.text)}&hd=1`);
        if (res.data?.data?.play) {
          videoUrl = res.data.data.hdplay || res.data.data.play;
          title = res.data.data.title || "TikTok Video";
        }
      } else if (cacheData.isYoutube) {
        const res = await axios.get(`${apiBase}/api/ytb/get?id=${encodeURIComponent(cacheData.text)}&type=video`);
        if (res.data?.data?.downloadLink) {
          videoUrl = res.data.data.downloadLink;
          title = res.data.data.title || "YouTube Video";
        }
      } else if (cacheData.isFacebook) {
        const res = await axios.get(`${apiBase}/api/fbdl?url=${encodeURIComponent(cacheData.text)}`);
        if (res.data?.hd || res.data?.sd) {
          videoUrl = res.data.hd || res.data.sd;
          title = res.data.title || "Facebook Video";
        }
      }

      if (!videoUrl) throw new Error("ভিডিও ডাউনলোড করার সুবিধা এই লিঙ্কে পাওয়া যায়নি।");

      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      const caption = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n──────────────────\n🎬 *${title}*\n──────────────────\n🧚‍♀️ 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓𝐁𝐎𝐓`;

      await bot.sendVideo(chatId, videoUrl, {
        caption: caption,
        reply_to_message_id: cacheData.messageId,
        parse_mode: "Markdown",
        reply_markup: replyMarkup
      });

      downloadCache.delete(key);

    } catch (err) {
      console.error("Auto Downloader Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* ${err.message}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );
      downloadCache.delete(key);
    }
  }
};
