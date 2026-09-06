const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "video";

module.exports = {
  name: COMMAND_NAME,
  version: "2.2.3",
  author: AUTHOR,
  category: "media",
  description: "Search & download YouTube videos using Multi-API Search",

  // 🎯 MULTI API SEARCH FUNCTION
  searchVideo: async function (query) {
    const apis = [
      `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`,
      `https://yt-api-imran.vercel.app/api/search?query=${encodeURIComponent(query)}`,
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}`
    ];

    for (let url of apis) {
      try {
        const res = await axios.get(url, { timeout: 10000 });

        let video = null;

        // API-1 format
        if (res.data?.[0]) video = res.data[0];
        // API-2 format
        else if (res.data?.results?.[0]) video = res.data.results[0];
        // API-3 fallback format
        else if (res.data?.items?.[0]) {
          const item = res.data.items[0];
          video = {
            title: item.snippet?.title,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`
          };
        }

        if (video?.url) return video;

      } catch (e) {
        continue; // Next API try
      }
    }

    return null;
  },

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = argsText ? argsText.trim() : "";

    if (!query) {
      return bot.sendMessage(
        chatId,
        `❌ *Please provide a song/video name.*\n📌 *Example:* \`/video Let Me Love You\``,
        { parse_mode: "Markdown", reply_to_message_id: messageId }
      );
    }

    // ১. সার্চিং স্ট্যাটাস মেসেজ
    const searchingMsg = await bot.sendMessage(
      chatId,
      `🔍 *Searching...*\n━━━━━━━━━━━━━━━\n📌 *Query:* ${query}\n⏳ *Please wait...*`,
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      // মাল্টি-এপিআই সার্চ
      const video = await module.exports.searchVideo(query);

      if (!video || !video.url) throw new Error("No results found from all search APIs.");

      // ২. ডাউনলোড স্ট্যাটাস মেসেজ এডিট
      await bot.editMessageText(
        `🎬 *Video Found*\n━━━━━━━━━━━━━━━\n📖 *Title:* ${video.title}\n⬇️ *Downloading...*`,
        { chat_id: chatId, message_id: searchingMsg.message_id, parse_mode: "Markdown" }
      );

      // ডাউনলোডার এপিআই কল
      const dlRes = await axios.get(
        `https://yt-api-imran.vercel.app/api?url=${video.url}`,
        { timeout: 15000 }
      );

      const downloadUrl = dlRes.data?.downloadUrl;
      if (!downloadUrl) throw new Error("Download link not available.");

      // ৩. লোডিং মেসেজ ডিলিট ও ভিডিও সেন্ড
      await bot.deleteMessage(chatId, searchingMsg.message_id);

      const caption =
`━━━━━━━━━━━━━━━━━━
🎬 *VIDEO READY*
━━━━━━━━━━━━━━━━━━
📖 *Title:* ${video.title}
⏱ *Duration:* ${video.time || "N/A"}
🖌️ *𝐏𝐎𝐖𝐄𝐑 𝐁𝐘:* ${AUTHOR}
━━━━━━━━━━━━━━━━━━`;

      await bot.sendVideo(chatId, downloadUrl, {
        caption: caption,
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });

    } catch (err) {
      console.error("Video Downloader Error:", err.message);
      await bot.editMessageText(
        `❌ *Failed*\n━━━━━━━━━━━━━━━\n${err.message || "An unexpected error occurred."}`,
        { chat_id: chatId, message_id: searchingMsg.message_id, parse_mode: "Markdown" }
      );
    }
  }
};
