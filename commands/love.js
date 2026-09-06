const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "love",
  version: "2.0.0",
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

    // 🎥 Videos list
    const links = [
      "https://drive.google.com/uc?id=1xLc_9r1TYGVM0J33hJ61hmW3yXOBTcEo",
      "https://drive.google.com/uc?id=1xFVA97twVhvJJzmxhXjT9QukwWEDRO2a",
      "https://drive.google.com/uc?id=1xC8J23XORH4zHsXCDkfrgzmVBm1_-b5E",
      "https://drive.google.com/uc?id=1x5EX0grUJwEKzHyzeR63HnzC_UlDdJD6",
      "https://drive.google.com/uc?id=1xM82tBosefpCvaDokhufHoikub1Opupz",
      "https://drive.google.com/uc?id=1xhCqfx7pScogeGph4T4ITnRJFYcUNmJ8",
      "https://drive.google.com/uc?id=1xTgkjk__QRMOVQnkQsSIcEzGfRUwUDLY",
      "https://drive.google.com/uc?id=1xRsWDPe485xXPna9nWhj0TaW_Q9lVJDd",
      "https://drive.google.com/uc?id=1xC30T2eSDWZGr_O8699yxaMS-AZ_X5y8",
      "https://drive.google.com/uc?id=1xcoHMLkNU1naPET4bP2sEiHoXUF23w-R",
      "https://drive.google.com/uc?id=1xcN88lPjPoRJhdxCUesuTFFArtvbUNL2",
      "https://drive.google.com/uc?id=1xUee8t4ukXW_XD4K4pGV_I4VFccwdyqt",
      "https://drive.google.com/uc?id=1xgfepctwXjZ5Y9kxhD3HcTTaJcsWHi-x",
      "https://drive.google.com/uc?id=1xhymaD6J1patQzfass5-e4ewUDg8gnQ9",
      "https://drive.google.com/uc?id=1xCvCvUa2zVWLm3y1pAGFKrr-emyaFicK",
      "https://drive.google.com/uc?id=1x87CHgjwaOjANyN_06_JqB-YKaUQGU2b"
    ];

    const link = links[Math.floor(Math.random() * links.length)];

    const loadingMsg = await bot.sendMessage(
      chatId,
      "⏳ *ভিডিও লোড হচ্ছে...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const cachePath = path.join(cacheDir, `sad_${Date.now()}.mp4`);

    try {
      const response = await axios({
        url: encodeURI(link),
        method: "GET",
        responseType: "stream"
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
          console.error("Video send error:", err);
        } finally {
          if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath);
          }
        }
      });

      writer.on("error", async (err) => {
        console.error("Write error:", err);
        await bot.editMessageText("❌ *ভিডিও সেভ করতে সমস্যা হয়েছে!*", {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: "Markdown"
        });
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });

    } catch (error) {
      console.error("Fetch error:", error);
      await bot.editMessageText("❌ *ভিডিও আনতে সমস্যা হয়েছে!*", {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: "Markdown"
      });
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }
  }
};
