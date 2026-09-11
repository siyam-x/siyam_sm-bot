const os = require("os");
const config = require("../config");

module.exports = {
  name: "up",
  aliases: ["uptime", "status", "আপ", "system"],
  version: "2.5.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0, // Everyone can use
  category: "system",
  shortDescription: "Shows bot uptime and system specs",
  longDescription: "Displays bot running time, ping, system RAM, CPU usage, and server details.",
  guide: "{pn}",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const startPing = Date.now();

    // Uptime Calculation
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const formattedUptime = `${days} দিন, ${hours} ঘণ্টা, ${minutes} মিনিট, ${seconds} সেকেন্ড`;

    // Memory Calculation
    const memoryUsage = process.memoryUsage();
    const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);

    // CPU & OS Details
    const endPing = Date.now() - startPing;
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const cpuCores = os.cpus().length;
    const platform = os.platform().toUpperCase();
    const nodeVersion = process.version;

    const statusText = 
`┏━━━━━━━━━━━━━━━━┓
 🤖 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒
┗━━━━━━━━━━━━━━━━┛
 ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞 : \`${formattedUptime}\`
 📡 𝐏𝐢𝐧𝐠   : \`${endPing} ms\`

📊 𝐒𝐞𝐫𝐯𝐞𝐫 𝐃𝐞𝐭𝐚𝐢𝐥𝐬:
 ✦ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬 𝐑𝐀𝐌 : \`${heapUsed} MB / ${heapTotal} MB\`
 ✦ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐑𝐀𝐌  : \`${usedMem} GB / ${totalMem} GB\`
 ✦ 𝐂𝐏𝐔 𝐋𝐨𝐚𝐝   : \`${cpuLoad}%\` (\`${cpuCores} Cores\`)
 ✦ 𝐎𝐒 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : \`${platform}\`
 ✦ 𝐍𝐨𝐝𝐞 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: \`${nodeVersion}\`
 ✦ 𝐏𝐈𝐃          : \`${process.pid}\`
━━━━━━━━━━━━━━━━━
 ✍️ 𝐀𝐮𝐭𝐡𝐨𝐫 : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

    try {
      await bot.sendMessage(chatId, statusText, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId
      });
    } catch (err) {
      console.error("Uptime Command Error:", err.message);
    }
  }
};
