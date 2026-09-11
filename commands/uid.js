const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  name: "uid",
  aliases: ["id", "userinfo"],
  version: "0.0.1",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "info",
  shortDescription: "Get user's UID and Stylist Banner",
  longDescription: "Generates an advanced Cool style banner with User ID and Avatar.",
  guide: "/uid",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let targetUser = msg.from;
    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetUser = msg.reply_to_message.from;
    }

    const targetID = targetUser.id;
    const name = (targetUser.first_name + (targetUser.last_name ? " " + targetUser.last_name : "")).toUpperCase();
    const cachePath = path.join(__dirname, `uid_card_${Date.now()}.png`);

    const processMsg = await bot.sendMessage(chatId, "-ˋˏ✄━═━═━═", { reply_to_message_id: messageId });

    try {
      const width = 1200;
      const height = 500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      for (let i = 0; i < width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 60) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#00f260");
      gradient.addColorStop(1, "#0575e6");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(300, 0);
      ctx.lineTo(250, 50);
      ctx.lineTo(0, 50);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width, height);
      ctx.lineTo(width - 300, height);
      ctx.lineTo(width - 250, height - 50);
      ctx.lineTo(width, height - 50);
      ctx.fill();

      let avatarBuffer;
      try {
        const userPhotos = await bot.getUserProfilePhotos(targetID, { limit: 1 });
        if (userPhotos && userPhotos.total_count > 0) {
          const fileId = userPhotos.photos[0][userPhotos.photos[0].length - 1].file_id;
          const fileLink = await bot.getFileLink(fileId);
          const res = await axios.get(fileLink, { responseType: "arraybuffer" });
          avatarBuffer = res.data;
        } else {
          throw new Error("No photo");
        }
      } catch (e) {
        const fallbackUrl = "https://i.imgur.com/6E4g5XJ.png";
        const res = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
        avatarBuffer = res.data;
      }

      const avatarImg = await loadImage(avatarBuffer);

      const centerX = 250;
      const centerY = 250;
      const hexSize = 160;

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(centerX + hexSize * Math.cos(i * 2 * Math.PI / 6), centerY + hexSize * Math.sin(i * 2 * Math.PI / 6));
      }
      ctx.closePath();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#00ffff";
      ctx.stroke();
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.clip();
      ctx.drawImage(avatarImg, centerX - hexSize, centerY - hexSize, hexSize * 2, hexSize * 2);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60px Arial";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 10;
      ctx.fillText(name, 480, 200);

      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 35px Courier New";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 15;
      ctx.fillText(`UID: ${targetID}`, 480, 270);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "25px Courier New";
      ctx.shadowBlur = 0;
      ctx.fillText("/// IDENTITY VERIFIED /// ", 480, 330);
      ctx.fillText("⚡ POWERED BY: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀Ns", 480, 370);

      ctx.fillStyle = "#ffffff";
      for (let k = 0; k < 20; k++) {
        let w = Math.random() * 10 + 2;
        ctx.fillRect(480 + (k * 20), 400, w, 20);
      }

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      try {
        await bot.deleteMessage(chatId, processMsg.message_id);
      } catch (e) {}

      await bot.sendPhoto(chatId, cachePath, {
        caption: `UID: ${targetID}`,
        reply_to_message_id: messageId
      });

      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

    } catch (error) {
      console.error(error);
      try {
        await bot.deleteMessage(chatId, processMsg.message_id);
      } catch (e) {}
      return bot.sendMessage(chatId, "❌ Error generating image: " + error.message, { reply_to_message_id: messageId });
    }
  }
};
