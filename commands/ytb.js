const axios = require("axios");

const AUTHOR = "Siyam Hasan";
const COMMAND_NAME = "ytb";

const baseApiUrl = async () => {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
    );
    return res.data.mahmud;
  } catch (e) {
    return "https://default-api.example.com";
  }
};

const apiList = async () => {
  const base = await baseApiUrl();
  return [
    base,
    "https://mahmudx7-api.vercel.app",
    "https://backup-api.example.com"
  ];
};

async function fetchWithFallback(urlBuilder) {
  const apis = await apiList();

  for (let base of apis) {
    try {
      const url = urlBuilder(base);
      const res = await axios.get(url, { timeout: 15000 });
      if (res?.data) return res.data;
    } catch (e) {}
  }

  throw new Error("All APIs failed");
}

module.exports = {
  name: COMMAND_NAME,
  version: "2.3.0",
  author: AUTHOR,
  category: "media",
  description: "YouTube Search and Direct Video Downloader",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const input = argsText ? argsText.trim() : "";

    if (!input) {
      return bot.sendMessage(
        chatId,
        "👉 *ব্যবহার:* `/ytb গান বা ভিডিওর নাম`",
        { parse_mode: "Markdown", reply_to_message_id: messageId }
      );
    }

    const loadingMsg = await bot.sendMessage(
      chatId,
      "🔎 *ইউটিউব থেকে ভিডিও খোঁজা হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      const data = await fetchWithFallback((base) =>
        `${base}/api/ytb/search?q=${encodeURIComponent(input)}`
      );

      const results = data?.results;

      if (!results || !results.length) {
        return bot.editMessageText(
          `⭕ *কোনো ফলাফল পাওয়া যায়নি:* ${input}`,
          { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown" }
        );
      }

      const topResult = results[0];

      await bot.editMessageText(
        `⬇️ *ডাউনলোড করা হচ্ছে:* ${topResult.title}\n⏱ *সময়:* ${topResult.time}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown" }
      );

      const videoData = await fetchWithFallback((base) =>
        `${base}/api/ytb/get?id=${topResult.id}&type=video`
      );

      const downloadLink = videoData?.data?.downloadLink;
      const title = videoData?.data?.title || topResult.title;

      if (!downloadLink) throw new Error("ডাউনলোড লিংক পাওয়া যায়নি।");

      await bot.deleteMessage(chatId, loadingMsg.message_id);

      const caption = `👑 *𝗢𝗪𝗡𝗘𝗥:* 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n\n🎬 *${title}*`;

      await bot.sendVideo(chatId, downloadLink, {
        caption: caption,
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });

    } catch (err) {
      console.error("YTB Download Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* ${err.message}`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown" }
      );
    }
  }
};
