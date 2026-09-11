const axios = require("axios");
const config = require("../config");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "downloader";
const API_TIMEOUT = 15000;

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0].replace(/[),.!?]+$/, "") : null;
}

function findVideoUrl(data) {
  if (!data) return null;
  const possibleKeys = [
    "video", "videoUrl", "video_url", "download", "downloadUrl", 
    "download_url", "url", "link", "play", "playUrl", "play_url", 
    "high", "hd", "hdplay", "nowm", "noWatermark", "no_watermark", "media"
  ];

  function search(obj, depth = 0) {
    if (!obj || depth > 7) return null;

    if (typeof obj === "string") {
      if (/^https?:\/\//i.test(obj) && /\.(mp4|m3u8|mov|webm)(\?|$)/i.test(obj)) {
        return obj;
      }
      if (/^https?:\/\//i.test(obj) && (obj.includes(".mp4") || obj.includes("video") || obj.includes("download"))) {
        return obj;
      }
      return null;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = search(item, depth + 1);
        if (result) return result;
      }
      return null;
    }

    if (typeof obj === "object") {
      for (const key of possibleKeys) {
        if (obj[key]) {
          const result = search(obj[key], depth + 1);
          if (result) return result;
        }
      }
      for (const key of Object.keys(obj)) {
        const result = search(obj[key], depth + 1);
        if (result) return result;
      }
    }
    return null;
  }

  return search(data);
}

function findTitle(data) {
  if (!data || typeof data !== "object") return "Downloaded Video";
  const keys = ["title", "caption", "description", "name"];

  for (const key of keys) {
    if (typeof data[key] === "string" && data[key].trim()) {
      return data[key].trim().slice(0, 900);
    }
  }

  if (data.data && typeof data.data === "object") return findTitle(data.data);
  if (data.result && typeof data.result === "object") return findTitle(data.result);

  return "Downloaded Video";
}

async function callApi(apiUrl) {
  const response = await axios.get(apiUrl, {
    timeout: API_TIMEOUT,
    maxRedirects: 5,
    validateStatus: status => status >= 200 && status < 400,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
      "Accept": "application/json,text/plain,*/*"
    }
  });
  return response.data;
}

async function tryDownload(url) {
  const encoded = encodeURIComponent(url);
  const apis = [
    { name: "TiklyDown", url: `https://api.tiklydown.eu.org/api/download?url=${encoded}` },
    { name: "Ruhend", url: `https://ruhend-api.onrender.com/api/alldown?url=${encoded}` },
    { name: "SnapTik", url: `https://api.snaptik.app/download?url=${encoded}` },
    { name: "TikWM", url: `https://www.tikwm.com/api/?url=${encoded}` },
    { name: "TikMate", url: `https://api.tikmate.app/api/download?url=${encoded}` },
    { name: "SaveTik", url: `https://savetik.co/api/download?url=${encoded}` }
  ];

  let lastError = null;

  for (const api of apis) {
    try {
      const data = await callApi(api.url);
      const videoUrl = findVideoUrl(data);

      if (videoUrl) {
        return {
          videoUrl,
          title: findTitle(data),
          api: api.name
        };
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw new Error(lastError ? lastError.message : "All downloader APIs failed.");
}

module.exports = {
  name: COMMAND_NAME,
  aliases: ["autodl", "dl", "download"],
  version: "3.0.0",
  author: AUTHOR,
  role: 0,
  category: "media",
  shortDescription: "Auto downloader for social media videos",
  longDescription: "Downloads videos automatically from Facebook, TikTok, Instagram & YouTube links.",
  guide: "{pn} [video link]",

  execute: async (bot, msg, args) => {
    if (module.exports.author !== AUTHOR || module.exports.name !== COMMAND_NAME) {
      return;
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const messageText = (args && args.join(" ")) || msg.text || msg.caption || "";

    const url = extractUrl(messageText);
    if (!url) return;

    let loadingMsg;
    try {
      loadingMsg = await bot.sendMessage(
        chatId,
        "⏳ তথ্য সংগ্রহ করা হচ্ছে...",
        { reply_to_message_id: messageId }
      );
    } catch (e) {
      console.error("Loading Message Error:", e.message);
    }

    try {
      let botUsername = config.botUsername || "SiyamSM_2026Bot";
      try {
        const me = await bot.getMe();
        botUsername = me.username;
      } catch (e) {}

      const result = await tryDownload(url);
      const videoUrl = result.videoUrl;
      const title = result.title || "Downloaded Video";
      const apiName = result.api;

      const safeTitle = String(title).replace(/[*_`[\]]/g, "").slice(0, 500);

      const captionText = 
`  𝗢𝗪𝗡𝗘𝗥 𝗦𝗜𝗬𝗔𝗠-𝗛𝗔𝗦𝗔𝗡
───────────────
» 🎬 𝗧𝗜𝗧𝗟𝗘: ${safeTitle}
» ⚡ 𝗦𝗘𝗥𝗩𝗘𝗥: ${apiName}
» 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: @${botUsername}
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
            { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝗥", url: `https://t.me/${config.ownerUsername || "ri_siyam"}` }
          ]
        ]
      };

      await bot.sendVideo(chatId, videoUrl, {
        caption: captionText,
        reply_to_message_id: messageId,
        reply_markup: replyMarkup,
        supports_streaming: true
      });

      if (loadingMsg) {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      }

    } catch (err) {
      console.error("Downloader Error:", err.message);

      if (loadingMsg) {
        try {
          await bot.deleteMessage(chatId, loadingMsg.message_id);
        } catch (e) {}
      }

      return bot.sendMessage(
        chatId,
        `❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে!\nএরর: ${err.message}`,
        { reply_to_message_id: messageId }
      );
    }
  }
};
