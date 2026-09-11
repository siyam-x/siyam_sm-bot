const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = {
  config: {
    name: "filecmd",
    aliases: ["file", "cmdcode"],
    version: "2.5",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    category: "owner",
    shortDescription: "View code of a command",
    longDescription: "View raw source code of commands safely",
    guide: "/filecmd <commandName>"
  },

  name: "filecmd",
  aliases: ["file", "cmdcode"],
  version: "2.5",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2,
  category: "owner",
  shortDescription: "View code of a command",
  longDescription: "View raw source code of commands safely",
  guide: "/filecmd <commandName>",

  execute: async (bot, msg, args) => {
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
        `  𝗢𝗪𝗡𝗘𝗥 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n───────────────\n» 👑 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n» 😾 কিরে ফাইল কি\n» 😴 তোর বাপে বানাইছে 🙄\n» 😾 সিয়াম  বসের \n» 🖕 চুদা খাবি নাকি 🥵\n───────────────\n» 👑 𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓 👑\n» ⚠️ যদি‌ এডমিন হন তাহলে config এ আইডি বসান।`,
        { reply_to_message_id: messageId }
      );
    }

    const cmdName = args[0];

    if (!cmdName) {
      return bot.sendMessage(
        chatId,
        "❌ | Please provide command name.\nExample: /filecmd help",
        { reply_to_message_id: messageId }
      );
    }

    const cleanCmdName = cmdName.replace(/\.js$/, "");
    const cmdPath = path.join(__dirname, `${cleanCmdName}.js`);

    if (!fs.existsSync(cmdPath)) {
      return bot.sendMessage(
        chatId,
        `❌ | Command "${cleanCmdName}" not found.`,
        { reply_to_message_id: messageId }
      );
    }

    try {
      const code = fs.readFileSync(cmdPath, "utf8");

      if (code.length > 4000) {
        const cachePath = path.join(__dirname, `${cleanCmdName}.txt`);
        fs.writeFileSync(cachePath, code);

        await bot.sendDocument(chatId, cachePath, {
          caption: `📄 | Source code of "${cleanCmdName}.js"`,
          reply_to_message_id: messageId
        });

        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        return;
      }

      return bot.sendMessage(
        chatId,
        `📄 | Source code of "${cleanCmdName}.js":\n\n\`\`\`javascript\n${code}\n\`\`\``,
        { parse_mode: "Markdown", reply_to_message_id: messageId }
      );

    } catch (err) {
      console.error("FileCmd Error:", err);
      return bot.sendMessage(
        chatId,
        "❌ | Error reading file.",
        { reply_to_message_id: messageId }
      );
    }
  }
};
