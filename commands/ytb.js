const axios = require("axios");

const AUTHOR = "Siyam Hasan";
const COMMAND_NAME = "ytb";

// ⚙️ আপনার বটের Username এবং Owner এর Username দিন (@ ছাড়া)
const BOT_USERNAME = "YourBotUsername"; 
const OWNER_USERNAME = "YourOwnerUsername";

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

  throw new Error("সবগুলো API রেসপন্স করতে ব্যর্থ হয়েছে!");
}

module.exports = {
  name: COMMAND_NAME,
  aliases: ["yt", "video"],
  version: "2.3.0",
  author: AUTHOR,
  role: 0,
  description: "YouTube Search and Direct Video Downloader",

  execute: async (bot, msg, argsText) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const input = Array.isArray(argsText) ? argsText.join(" ").trim() : (argsText ? argsText.trim() : "");

    // বাটন কনফিগারেশন
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    if (!input) {
      return bot.sendMessage(
        chatId,
        "👉 *ব্যবহার:* `/ytb গান বা ভিডিওর নাম`",
        { 
          parse_mode: "Markdown", 
          reply_to_message_id: messageId,
          reply_markup: replyMarkup 
        }
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
          `⭕ *কোনো ফলাফল পাওয়া যায়নি:* \`${input}\``,
          { 
            chat_id: chatId, 
            message_id: loadingMsg.message_id, 
            parse_mode: "Markdown",
            reply_markup: replyMarkup
          }
        );
      }

      const topResult = results[0];

      await bot.editMessageText(
        `⬇️ *ডাউনলোড করা হচ্ছে:* \`${topResult.title}\`\n⏱ *সময়:* \`${topResult.time || "N/A"}\``,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown" }
      );

      const videoData = await fetchWithFallback((base) =>
        `${base}/api/ytb/get?id=${topResult.id}&type=video`
      );

      const downloadLink = videoData?.data?.downloadLink;
      const title = videoData?.data?.title || topResult.title;

      if (!downloadLink) throw new Error("ডাউনলোড লিংক পাওয়া যায়নি।");

      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      const caption = `👑 𝐎𝐖𝐍𝐄𝐑: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n──────────────────\n🎬 *${title}*\n──────────────────\n🧚‍♀️ 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓𝐁𝐎𝐓`;

      await bot.sendVideo(chatId, downloadLink, {
        caption: caption,
        reply_to_message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: replyMarkup
      });

    } catch (err) {
      console.error("YTB Download Error:", err.message);
      await bot.editMessageText(
        `❌ *সমস্যা:* ${err.message}`,
        { 
          chat_id: chatId, 
          message_id: loadingMsg.message_id, 
          parse_mode: "Markdown",
          reply_markup: replyMarkup
        }
      );
    }
  }
};
