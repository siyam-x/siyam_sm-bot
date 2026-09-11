const axios = require("axios");

const AUTHOR = "Siyam Hasan";
const COMMAND_NAME = "tiktok";

const TIKWM_ENDPOINT = "https://www.tikwm.com/api/";

// ⚙️ আপনার বটের Username এবং Owner এর Username দিন (@ ছাড়া)
const BOT_USERNAME = "YourBotUsername"; 
const OWNER_USERNAME = "YourOwnerUsername";

module.exports = {
  name: COMMAND_NAME,
  aliases: ["tt", "ttdl"],
  version: "1.0.0",
  author: AUTHOR,
  category: "media",
  description: "TikTok Video and Audio Downloader",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const input = Array.isArray(argsText) ? argsText.join(" ").trim() : (argsText ? argsText.trim() : "");

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    if (!input || !input.includes("tiktok.com")) {
      return bot.sendMessage(
        chatId,
        "👉 *ব্যবহার:* `/tiktok <টিকটক ভিডিও লিঙ্ক>`",
        { parse_mode: "Markdown", reply_to_message_id: messageId, reply_markup: replyMarkup }
      );
    }

    const loadingMsg = await bot.sendMessage(
      chatId,
      "🔎 *টিকটক থেকে ভিডিও প্রসেস করা হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      const res = await axios.get(`${TIKWM_ENDPOINT}?url=${encodeURIComponent(input)}&hd=1`, { timeout: 15000 });
      const data = res.data?.data;

      if (!data || !data.play) {
        throw new Error("ভিডিও লিঙ্কটি কাজ করছে না অথবা প্রাইভেট ভিডিও।");
      }

      const videoUrl = data.hdplay || data.play;
      const title = data.title || "TikTok Video";

      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      const caption = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n──────────────────\n🎬 *${title}*\n──────────────────\n🧚‍♀️ 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓𝐁𝐎𝐓`;

      await bot.sendVideo(chatId, videoUrl, {
        caption: caption,
        reply_to_message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: replyMarkup
      });

    } catch (err) {
      console.error("TikTok Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* ${err.message}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );
    }
  }
};
