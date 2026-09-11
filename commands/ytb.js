const axios = require("axios");

const BOT_USERNAME = "SiyamSM_2026Bot";
const OWNER_USERNAME = "ri_siyam";

const searchCache = new Map();

const baseApiUrl = async () => {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
      { timeout: 5000 }
    );
    return res.data?.mahmud || "https://mahmudx7-api.vercel.app";
  } catch (e) {
    return "https://mahmudx7-api.vercel.app";
  }
};

const apiList = async () => {
  const base = await baseApiUrl();
  return [base, "https://mahmudx7-api.vercel.app"];
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
  throw new Error("API রেসপন্স করতে ব্যর্থ হয়েছে!");
}

module.exports = {
  name: "ytb",
  aliases: ["yt"],
  version: "6.3",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "YouTube search and downloader with selection buttons",
  longDescription: "Searches songs from YouTube with thumbnail and provides 1-6 download buttons",
  category: "media",
  guide: "{pn} <song name>",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const input = Array.isArray(argsText) ? argsText.join(" ").trim() : (argsText ? argsText.trim() : "");

    const defaultButtons = [
      [
        { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
        { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
      ]
    ];

    if (!input) {
      return bot.sendMessage(
        chatId,
        "👉 ব্যবহার: /ytb গানের নাম",
        {
          reply_to_message_id: messageId,
          reply_markup: { inline_keyboard: defaultButtons }
        }
      );
    }

    const loadingMsg = await bot.sendMessage(
      chatId,
      "🔎 ইউটিউব থেকে সার্চ করা হচ্ছে...",
      { reply_to_message_id: messageId }
    );

    try {
      const data = await fetchWithFallback((base) =>
        `${base}/api/ytb/search?q=${encodeURIComponent(input)}`
      );

      const results = data?.results;

      if (!results || !results.length) {
        return bot.editMessageText(
          `⭕ কোনো ফলাফল পাওয়া যায়নি: ${input}`,
          { chat_id: chatId, message_id: loadingMsg.message_id }
        );
      }

      const topResults = results.slice(0, 6);
      searchCache.set(chatId, topResults);

      let listText = `🔍 সার্চ রেজাল্ট: "${input}"\n\n`;
      topResults.forEach((item, index) => {
        listText += `${index + 1}. ${item.title}\n⏱ সময়: ${item.time || "N/A"}\n\n`;
      });
      listText += "👇 যে গানটি ডাউনলোড করতে চান নিচের বাটনে চাপ দিন:";

      const selectionButtons = [
        [
          { text: "1️⃣", callback_data: `ytdl_0` },
          { text: "2️⃣", callback_data: `ytdl_1` },
          { text: "3️⃣", callback_data: `ytdl_2` }
        ],
        [
          { text: "4️⃣", callback_data: `ytdl_3` },
          { text: "5️⃣", callback_data: `ytdl_4` },
          { text: "6️⃣", callback_data: `ytdl_5` }
        ],
        ...defaultButtons
      ];

      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      const thumbnailUrl = topResults[0].thumbnail || topResults[0].image || `https://img.youtube.com/vi/${topResults[0].id}/hqdefault.jpg`;

      await bot.sendPhoto(chatId, thumbnailUrl, {
        caption: listText,
        reply_to_message_id: messageId,
        reply_markup: { inline_keyboard: selectionButtons }
      });

    } catch (err) {
      console.error("YTB Search Error:", err.message);
      await bot.editMessageText(
        `❌ সমস্যা: ${err.message}`,
        { chat_id: chatId, message_id: loadingMsg.message_id }
      );
    }
  },

  handleCallback: async (bot, query) => {
    const data = query.data;
    if (!data || !data.startsWith("ytdl_")) return;

    const chatId = query.message.chat.id;
    const index = parseInt(data.split("_")[1]);

    const results = searchCache.get(chatId);
    if (!results || !results[index]) {
      return bot.answerCallbackQuery(query.id, { text: "⚠️ সার্চ তথ্য পাওয়া যায়নি! আবার সার্চ করুন।", show_alert: true });
    }

    const selectedSong = results[index];
    await bot.answerCallbackQuery(query.id, { text: `⬇️ ${selectedSong.title} ডাউনলোড শুরু হচ্ছে...` });

    const statusMsg = await bot.sendMessage(chatId, `⏳ ডাউনলোড করা হচ্ছে: ${selectedSong.title}`);

    try {
      const videoData = await fetchWithFallback((base) =>
        `${base}/api/ytb/get?id=${selectedSong.id}&type=audio`
      );

      const downloadLink = videoData?.data?.downloadLink || videoData?.downloadLink;
      if (!downloadLink) throw new Error("ডাউনলোড লিঙ্ক পাওয়া যায়নি!");

      try {
        await bot.deleteMessage(chatId, statusMsg.message_id);
      } catch (e) {}

      const caption = `🎵 ${selectedSong.title}\n⏱ সময়: ${selectedSong.time || "N/A"}\n\n👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n🧚‍♀️ 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓𝐁𝐎𝐓`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
            { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
          ]
        ]
      };

      await bot.sendAudio(chatId, downloadLink, {
        caption: caption,
        title: selectedSong.title,
        reply_to_message_id: query.message.reply_to_message ? query.message.reply_to_message.message_id : undefined,
        reply_markup: replyMarkup
      });

    } catch (err) {
      console.error("YTB Download Error:", err.message);
      await bot.editMessageText(
        `❌ ডাউনলোড করতে সমস্যা হয়েছে: ${err.message}`,
        { chat_id: chatId, message_id: statusMsg.message_id }
      );
    }
  }
};
