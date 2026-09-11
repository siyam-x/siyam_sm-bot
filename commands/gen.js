const fs = require("fs");
const axios = require("axios");
const path = require("path");

let lastPlayed = -1;

const AUTHOR_LOCK = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  name: "gan",
  aliases: ["song", "music"],
  version: "1.0.2",
  author: AUTHOR_LOCK,
  role: 0,
  category: "media",
  shortDescription: "Play random song with command 🎶",
  longDescription: "Sends a random mp3 song from preset Catbox links.",
  guide: "/gan",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (module.exports.author !== AUTHOR_LOCK) {
      return bot.sendMessage(chatId, "⛔ Author lock failed! File modified.", { reply_to_message_id: messageId });
    }

    const songLinks = [
      "https://files.catbox.moe/jx9cpq.mp4",
      "https://files.catbox.moe/jzg3j7.mp4",
      "https://files.catbox.moe/m4nggm.mp4",
      "https://files.catbox.moe/dbxfju.mp4",
      "https://files.catbox.moe/xx6d7i.mp4",
      "https://files.catbox.moe/0gncxf.mp4",
      "https://files.catbox.moe/gcm88s.mp4",
      "https://files.catbox.moe/yz23lp.mp4",
      "https://files.catbox.moe/etsdn9.mp3",
      "https://files.catbox.moe/ayepdz.mp3",
      "https://files.catbox.moe/oaecnx.mp3",
      "https://files.catbox.moe/xtpf61.mp3",
      "https://files.catbox.moe/12grz0.mp3",
      "https://files.catbox.moe/aaqddo.mp3",
      "https://files.catbox.moe/k3acvx.mp3",
      "https://files.catbox.moe/nry1qv.mp3",
      "https://files.catbox.moe/23e8u1.mp3",
      "https://files.catbox.moe/y8dzik.mp3",
      "https://files.catbox.moe/z9d2e6.mp3",
      "https://files.catbox.moe/23e8u1.mp3",
      "https://files.catbox.moe/0xscc8.mp3",
      "https://files.catbox.moe/q4m2ad.mp3",
      "https://files.catbox.moe/y8bg4r.mp3",
      "https://files.catbox.moe/q61co1.mp3",
      "https://files.catbox.moe/euq7fo.mp3",
      "https://files.catbox.moe/x5f56o.mp3",
      "https://files.catbox.moe/avlqok.mp3",
      "https://files.catbox.moe/v0twt3.mp3",
      "https://files.catbox.moe/qmpvpt.mp3"
    ];

    if (songLinks.length === 0) {
      return bot.sendMessage(chatId, "❌ No songs could be found!", { reply_to_message_id: messageId });
    }

    try {
      if (typeof bot.setMessageReaction === "function") {
        await bot.setMessageReaction(chatId, messageId, { reaction: [{ type: "emoji", emoji: "🎵" }] });
      }
    } catch (e) {}

    let index;
    do {
      index = Math.floor(Math.random() * songLinks.length);
    } while (index === lastPlayed && songLinks.length > 1);

    lastPlayed = index;

    const url = songLinks[index];
    const isVideo = url.endsWith(".mp4");
    const ext = isVideo ? "mp4" : "mp3";
    const filePath = path.join(__dirname, `song_${Date.now()}.${ext}`);

    try {
      const response = await axios({ url, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          if (isVideo) {
            await bot.sendVideo(chatId, filePath, { caption: "🎶 Here's your song 🎧", reply_to_message_id: messageId });
          } else {
            await bot.sendAudio(chatId, filePath, { caption: "🎶 Here's your song 🎧", reply_to_message_id: messageId });
          }
        } catch (err) {
          await bot.sendMessage(chatId, "❌ Failed to send song!", { reply_to_message_id: messageId });
        } finally {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });

      writer.on("error", () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        bot.sendMessage(chatId, "❌ Failed to send song!", { reply_to_message_id: messageId });
      });

    } catch (err) {
      bot.sendMessage(chatId, "⚠️ Failed to download song!", { reply_to_message_id: messageId });
    }
  }
};
