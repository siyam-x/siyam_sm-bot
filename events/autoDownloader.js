const axios = require("axios");

const BOT_USERNAME = "YourBotUsername"; 
const OWNER_USERNAME = "YourOwnerUsername";

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
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text ? msg.text.trim() : "";

    const isTiktok = /https?:\/\/(www\.|vt\.|vm\.)?tiktok\.com\/.+/i.test(text);
    const isYoutube = /https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/i.test(text);
    const isFacebook = /https?:\/\/(www\.|fb\.|facebook\.com)\/.+/i.test(text);

    if (!isTiktok && !isYoutube && !isFacebook) return false;

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
      "🔎 *ভিডিও প্রসেস ও ডাউনলোড করা হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      const apiBase = await baseApiUrl();
      let videoUrl = "";
      let title = "Video Downloaded";

      if (isTiktok) {
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`);
        if (res.data?.data?.play) {
          videoUrl = res.data.data.hdplay || res.data.data.play;
          title = res.data.data.title || "TikTok Video";
        }
      } else if (isYoutube) {
        const res = await axios.get(`${apiBase}/api/ytb/get?id=${encodeURIComponent(text)}&type=video`);
        if (res.data?.data?.downloadLink) {
          videoUrl = res.data.data.downloadLink;
          title = res.data.data.title || "YouTube Video";
        }
      } else if (isFacebook) {
        const res = await axios.get(`${apiBase}/api/fbdl?url=${encodeURIComponent(text)}`);
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
        reply_to_message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: replyMarkup
      });

      return true;

    } catch (err) {
      console.error("Auto Downloader Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* ${err.message}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown", reply_markup: replyMarkup }
      );
      return true;
    }
  }
}; 
