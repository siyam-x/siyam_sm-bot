const config = require("../config");

module.exports = {
  config: {
    name: "reset",
    aliases: ["restart", "reboot"],
    version: "1.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    category: "owner",
    shortDescription: "Resets and restarts the bot completely",
    longDescription: "Clears cached modules and restarts the bot process cleanly.",
    guide: "/reset"
  },

  name: "reset",
  aliases: ["restart", "reboot"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "owner",
  shortDescription: "Resets and restarts the bot completely",
  longDescription: "Clears cached modules and restarts the bot process cleanly.",
  guide: "/reset",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const senderID = String(msg.from.id);

    let adminList = [];
    if (config.adminIDs && Array.isArray(config.adminIDs)) {
      adminList = config.adminIDs.map(id => String(id));
    } else if (config.adminID) {
      adminList = [String(config.adminID)];
    } else if (config.ownerID) {
      adminList = [String(config.ownerID)];
    }

    const isAdmin = adminList.includes(senderID);

    if (!isAdmin) {
      return bot.sendMessage(
        chatId,
        "❌ | শুধুমাত্র বটের এডমিন এই কমান্ডটি ব্যবহার করতে পারবেন।",
        { reply_to_message_id: messageId }
      );
    }

    await bot.sendMessage(
      chatId,
      "🔄 *বট সম্পূর্ণ রিসেট ও রিস্টার্ট হচ্ছে...*\nঅনুগ্রহ করে কিছু সময় অপেক্ষা করুন।",
      { parse_mode: "Markdown", reply_to_message_id: messageId }
    );

    setTimeout(() => {
      Object.keys(require.cache).forEach((key) => {
        delete require.cache[key];
      });
      process.exit(0);
    }, 1000);
  }
};
