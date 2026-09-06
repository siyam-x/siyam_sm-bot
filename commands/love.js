const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "love",
  version: "2.1.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  category: "media",
  description: "Sends random love/sad video with emotional captions 💔",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // 💔 Captions
    const captions = [
      "===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」=== \n--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖-- \n✢━━━━━━━━━━━━━━━✢        \n🎀 ♡-𝐋💞𝐕𝐄-𝐕𝐈𝐃𝐄💍-♡ 🎀 \n✢━━━━━━━━━━━━━━━✢\n(✷‿𝐎𝐖𝐍𝐄𝐑:-‿𝐃𝐒-𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍✷)"
    ];

    const caption = captions[Math.floor(Math.random() * captions.length)];

    // 🎥 Google Drive Raw Links
    const rawLinks = [
      "1xLc_9r1TYGVM0J33hJ61hmW3yXOBTcEo",
      "1xFVA97twVhvJJzmxhXjT9QukwWEDRO2a",
      "1xC8J23XORH4zHsXCDkfrgzmVBm1_-b5E",
      "1x5EX0grUJwEKzHyzeR63HnzC_UlDdJD6",
      "1xM82tBosefpCvaDokhufHoikub1Opupz",
      "1xhCqfx7pScogeGph4T4ITnRJFYcUNmJ8",
      "1xTgkjk__QRMOVQnkQsSIcEzGfRUwUDLY",
      "1xRsWDPe485xXPna9nWhj0TaW_Q9lVJDd",
      "1xC30T2eSDWZGr_O8699yxaMS-AZ_X5y8",
      "1xcoHMLkNU1naPET4bP2sEiHoXUF23w-R",
      "1xcN88lPjPoRJhdxCUesuTFFArtvbUNL2",
      "1xUee8t4ukXW_XD4K4pGV_I4VFccwdyqt",
      "1xgfepctwXjZ5Y9kxhD3HcTTaJcsWHi-x",
      "1xhymaD6J1patQzfass5-e4ewUDg8gnQ9",
      "1xCvCvUa2zVWLm3y1pAGFKrr-emyaFicK",
      "1x87CHgjwaOjANyN_06_JqB-YKaUQGU2b"
    ];

    // যেকোনো একটি আইডি সিলেক্ট করে Direct Download Link তৈরি করা হলো
    const randomId = rawLinks[Math.floor(Math.random() * rawLinks.length)];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${randomId}`;

    const loadingMsg = await bot.sendMessage(
      chatId,
      "⏳ *ভিডিও ডাউনলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const cachePath = path.join(cacheDir, `sad_${Date.now()}.mp4`);

    try {
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 60000
      });

      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          await bot.deleteMessage(chatId, loadingMsg.message_id);

          await bot.sendVideo(chatId, cachePath, {
            caption: caption,
            reply_to_message_id: messageId
          });
        } catch (err) {
          console.error("Send video error:", err);
        } finally {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }
      });

      writer.on("error", async (err) => {
        console.error("File Save Error:", err);
        await bot.editMessageText("❌ *ভিডিও ফাইল সেভ হতে সমস্যা হয়েছে!*", {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: "Markdown"
        });
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });

    } catch (error) {
      console.error("Download Request Error:", error.message);
      await bot.editMessageText("❌ *গুগল ড্রাইভ থেকে ভিডিও আনতে সমস্যা হয়েছে!*", {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: "Markdown"
      });
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }
  }
};
