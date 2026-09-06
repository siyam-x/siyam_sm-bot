const LOCKED_AUTHOR = "SIYAM-HASAN";
const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  name: "up",
  version: "6.0.0",
  author: LOCKED_AUTHOR,
  category: "system",
  description: "Advanced real-time status card with detailed system info",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const start = Date.now();

    const loadingMsg = await bot.sendMessage(
      chatId,
      "⚙️ *System status card is generating...*",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memory = process.memoryUsage();
      const usedRAM = (memory.heapUsed / 1024 / 1024).toFixed(1);
      const totalHeap = (memory.heapTotal / 1024 / 1024).toFixed(1);
      const ping = Date.now() - start;

      const cpuLoad = os.loadavg()[0].toFixed(2);
      const cpuCores = os.cpus().length;
      const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
      const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
      const usedMemGB = (totalMemGB - freeMemGB).toFixed(1);
      const memPercent = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);
      const heapPercent = ((memory.heapUsed / memory.heapTotal) * 100).toFixed(1);

      const platform = os.platform();
      const arch = os.arch();
      const hostname = os.hostname();
      const nodeVersion = process.version;
      const pid = process.pid;

      const width = 980;
      const height = 640;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#05050c");
      bg.addColorStop(0.5, "#0b0b16");
      bg.addColorStop(1, "#070710");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Lights
      const light1 = ctx.createRadialGradient(490, 0, 20, 490, 90, 480);
      light1.addColorStop(0, "rgba(139, 92, 246, 0.2)");
      light1.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = light1;
      ctx.fillRect(0, 0, width, height);

      const light2 = ctx.createRadialGradient(900, 600, 30, 850, 500, 280);
      light2.addColorStop(0, "rgba(34, 211, 238, 0.14)");
      light2.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = light2;
      ctx.fillRect(0, 0, width, height);

      // Main Card
      ctx.save();
      ctx.shadowColor = "rgba(139, 92, 246, 0.35)";
      ctx.shadowBlur = 30;
      roundRect(ctx, 35, 35, 910, 570, 28);
      ctx.fillStyle = "rgba(12, 12, 24, 0.96)";
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "rgba(167, 139, 250, 0.4)";
      ctx.lineWidth = 2.5;
      roundRect(ctx, 35, 35, 910, 570, 28);
      ctx.stroke();

      // Header
      const headerGrad = ctx.createLinearGradient(55, 55, 925, 55);
      headerGrad.addColorStop(0, "#7c3aed");
      headerGrad.addColorStop(1, "#06b6d4");
      ctx.fillStyle = headerGrad;
      roundRect(ctx, 55, 55, 870, 68, 16);
      ctx.fill();

      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("SIYAM-HASAN  •  BOT STATUS", 490, 98);

      // Big Uptime
      ctx.fillStyle = "rgba(24, 24, 46, 0.95)";
      roundRect(ctx, 60, 145, 860, 90, 14);
      ctx.fill();
      ctx.fillStyle = "#a78bfa";
      ctx.fillRect(60, 145, 860, 5);

      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#c4b5fd";
      ctx.fillText("BOT UPTIME", 490, 175);

      ctx.font = "bold 34px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${days}d   ${hours}h   ${minutes}m   ${seconds}s`, 490, 215);

      // 4 Info Boxes
      const boxes = [
        { title: "PING", value: `${ping} ms`, x: 60, color: "#34d399" },
        { title: "PROCESS RAM", value: `${usedRAM} MB`, x: 280, color: "#fbbf24" },
        { title: "CPU LOAD", value: cpuLoad, x: 500, color: "#22d3ee" },
        { title: "CPU CORES", value: `${cpuCores}`, x: 720, color: "#a78bfa" }
      ];

      boxes.forEach((box) => {
        const y = 255;
        ctx.fillStyle = "rgba(24, 24, 46, 0.95)";
        roundRect(ctx, box.x, y, 200, 85, 12);
        ctx.fill();

        ctx.fillStyle = box.color;
        ctx.shadowColor = box.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(box.x, y, 200, 4);
        ctx.shadowBlur = 0;

        ctx.font = "bold 13px Arial";
        ctx.fillStyle = "#a5b4fc";
        ctx.textAlign = "center";
        ctx.fillText(box.title, box.x + 100, y + 32);

        ctx.font = "bold 22px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(box.value, box.x + 100, y + 62);
      });

      // Progress Bars Section
      ctx.fillStyle = "rgba(24, 24, 46, 0.95)";
      roundRect(ctx, 60, 360, 860, 100, 12);
      ctx.fill();
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(60, 360, 860, 4);

      // Process RAM Bar
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#a5b4fc";
      ctx.textAlign = "left";
      ctx.fillText(`Process RAM  ${heapPercent}%`, 85, 395);

      ctx.fillStyle = "rgba(50, 50, 80, 1)";
      roundRect(ctx, 85, 410, 380, 14, 7);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      roundRect(ctx, 85, 410, Math.min(380, 380 * (heapPercent / 100)), 14, 7);
      ctx.fill();

      // System RAM Bar
      ctx.fillStyle = "#a5b4fc";
      ctx.fillText(`System RAM  ${memPercent}%`, 500, 395);

      ctx.fillStyle = "rgba(50, 50, 80, 1)";
      roundRect(ctx, 500, 410, 380, 14, 7);
      ctx.fill();
      ctx.fillStyle = "#22d3ee";
      roundRect(ctx, 500, 410, Math.min(380, 380 * (memPercent / 100)), 14, 7);
      ctx.fill();

      ctx.font = "12px Arial";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${usedRAM} / ${totalHeap} MB`, 85, 445);
      ctx.fillText(`${usedMemGB} / ${totalMemGB} GB`, 500, 445);

      // Bottom Details
      ctx.fillStyle = "rgba(24, 24, 46, 0.95)";
      roundRect(ctx, 60, 480, 860, 95, 12);
      ctx.fill();
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(60, 480, 860, 4);

      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#a5b4fc";
      ctx.textAlign = "left";

      ctx.fillText("Node.js", 85, 515);
      ctx.fillText("Platform", 85, 550);
      ctx.fillText("Architecture", 300, 515);
      ctx.fillText("Hostname", 300, 550);
      ctx.fillText("PID", 560, 515);
      ctx.fillText("Status", 560, 550);

      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(nodeVersion, 170, 515);
      ctx.fillText(platform.toUpperCase(), 170, 550);
      ctx.fillText(arch.toUpperCase(), 420, 515);
      ctx.fillText(hostname.substring(0, 14), 400, 550);
      ctx.fillText(String(pid), 620, 515);
      ctx.fillText("ONLINE", 640, 550);

      // Footer
      ctx.textAlign = "right";
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#c4b5fd";
      ctx.fillText("TELEGRAM CHATBOT", 890, 530);
      ctx.font = "12px Arial";
      ctx.fillStyle = "#7c3aed";
      ctx.fillText("Premium Real-time Card", 890, 555);

      // Save Image
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const filePath = path.join(cachePath, `status_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(filePath, buffer);

      // Delete Loading Message
      await bot.deleteMessage(chatId, loadingMsg.message_id);

      // Send Photo
      await bot.sendPhoto(chatId, filePath, {
        caption: "📊 *BOT REAL-TIME SYSTEM STATUS*",
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });

      // Cleanup
      setTimeout(() => fs.unlink(filePath).catch(() => {}), 15000);

    } catch (err) {
      console.error("Status Card Error:", err);
      await bot.editMessageText(
        "❌ *Failed to generate status card.*",
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "Markdown" }
      );
    }
  }
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
