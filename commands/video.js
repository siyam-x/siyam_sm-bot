const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "video";

const BOT_USERNAME = "SiyamSM_2026Bot";
const OWNER_USERNAME = "ri_siyam";

const getWorkingBaseApi = async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json", { timeout: 5000 });
    return res.data?.mahmud || "https://mahmudx7-api.vercel.app";
  } catch (e) {
    return "https://mahmudx7-api.vercel.app";
  }
};

module.exports = {
  name: COMMAND_NAME,
  aliases: ["v"],
  version: "2.2.3",
  author: AUTHOR,
  role: 0,
  category: "media",
  description: "Search & download YouTube videos using Multi-API Search",

  searchVideo: async function (query) {
    const baseApi = await getWorkingBaseApi();
    const apis = [
      `${baseApi}/api/ytb/search?q=${encodeURIComponent(query)}`,
      `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`
    ];

    for (let url of apis) {
      try {
        const res = await axios.get(url, { timeout: 10000 });
        let video = null;

        if (res.data?.results?.[0]) {
          const item = res.data.results[0];
          video = {
            id: item.id,
            title: item.title,
            time: item.time || item.duration || "N/A",
            url: item.url || `https://www.youtube.com/watch?v=${item.id}`
          };
        } else if (res.data?.[0]) {
          const item = res.data[0];
          video = {
            id: item.id || item.videoId,
            title: item.title,
            time: item.duration || "N/A",
            url: item.url || `https://www.youtube.com/watch?v=${item.id}`
          };
        }

        if (video) return video;
      } catch (e) {
        continue;
      }
    }

    return null;
  },

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = Array.isArray(argsText) ? argsText.join(" ").trim() : (argsText ? argsText.trim() : "");

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    if (!query) {
      return bot.sendMessage(
        chatId,
        "❌ Please provide a song/video name.\n📌 Example: /video Let Me Love You",
        { 
          reply_to_message_id: messageId,
          reply_markup: replyMarkup
        }
      );
    }

    const searchingMsg = await bot.sendMessage(
      chatId,
      `🔍 Searching...\n━━━━━━━━━━━━━━━\n📌 Query: ${query}\n⏳ Please wait...`,
      { reply_to_message_id: messageId }
    );

    try {
      const video = await module.exports.searchVideo(query);

      if (!video || !video.url) throw new Error("No results found from all search APIs.");

      await bot.editMessageText(
        `🎬 Video Found\n━━━━━━━━━━━━━━━\n📖 Title: ${video.title}\n⬇️ Downloading...`,
        { chat_id: chatId, message_id: searchingMsg.message_id }
      );

      const baseApi = await getWorkingBaseApi();
      const videoId = video.id || (video.url ? video.url.split("v=")[1] : null);

      let downloadUrl = null;

      try {
        if (videoId) {
          const dlRes = await axios.get(`${baseApi}/api/ytb/get?id=${videoId}&type=video`, { timeout: 15000 });
          downloadUrl = dlRes.data?.data?.downloadLink || dlRes.data?.downloadLink;
        }
      } catch (e) {}

      if (!downloadUrl) {
        try {
          const cobaltRes = await axios.post(`https://api.cobalt.tools/api/json`, {
            url: video.url
          }, {
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            timeout: 15000
          });
          downloadUrl = cobaltRes.data?.url;
        } catch (e) {}
      }

      if (!downloadUrl) throw new Error("Download link not available.");

      try {
        await bot.deleteMessage(chatId, searchingMsg.message_id);
      } catch (e) {}

      const caption =
`━━━━━━━━━━━━━━━━━━
🎬 VIDEO READY
━━━━━━━━━━━━━━━━━━
📖 Title: ${video.title}
⏱ Duration: ${video.time || "N/A"}
🖌️ 𝐏𝐎𝐖𝐄𝐑 𝐁𝐘: ${AUTHOR}
━━━━━━━━━━━━━━━━━━`;

      await bot.sendVideo(chatId, downloadUrl, {
        caption: caption,
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });

    } catch (err) {
      console.error("Video Downloader Error:", err.message);
      await bot.editMessageText(
        `❌ Failed\n━━━━━━━━━━━━━━━\n${err.message || "An unexpected error occurred."}`,
        { 
          chat_id: chatId, 
          message_id: searchingMsg.message_id,
          reply_markup: replyMarkup
        }
      );
    }
  }
};
