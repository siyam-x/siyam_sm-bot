const os = require("os");

module.exports = {
  name: "up",
  aliases: ["uptime", "status", "আপ"],
  version: "2.0.0",
  author: "SIYAM-HASAN",
  category: "system",
  description: "Shows bot uptime and system statistics",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const startTime = Date.now();

    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const formattedUptime = `*${days}* দিন, *${hours}* ঘণ্টা, *${minutes}* মিনিট, *${seconds}* সেকেন্ড`;

    const memoryUsage = process.memoryUsage();
    const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);

    const ping = Date.now() - startTime;
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const cpuCores = os.cpus().length;
    const platform = os.platform().toUpperCase();
    const nodeVersion = process.version;

    const statusText = 
      `🤖 *BOT SYSTEM STATUS*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⏱️ *রানিং টাইম:* ${formattedUptime}\n\n` +
      `📊 *সিস্টেম ডিটেইলস:*\n` +
      `• *পিং (Ping):* *${ping} ms*\n` +
      `• *প্রসেস র‌্যাম:* *${heapUsed} MB / ${heapTotal} MB*\n` +
      `• *সিস্টেম র‌্যাম:* *${usedMem} GB / ${totalMem} GB*\n` +
      `• *সিপিইউ লোড:* *${cpuLoad}%*\n` +
      `• *সিপিইউ কোর:* *${cpuCores} Cores*\n` +
      `• *প্লাটফর্ম:* *${platform}*\n` +
      `• *নোড ভার্সন:* *${nodeVersion}*\n` +
      `• *প্রসেস আইডি (PID):* *${process.pid}*\n\n` +
      `👑 *অনার:* *SIYAM-HASAN*`;

    try {
      await bot.sendMessage(chatId, statusText, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });
    } catch (err) {
      console.error("Uptime Error:", err.message);
    }
  }
};
