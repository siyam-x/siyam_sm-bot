const config = require("../config");

module.exports = {
  name: "prefix",
  aliases: ["pfx", "পোল"],
  version: "1.0.5",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0, // Everyone can use
  category: "system",
  usePrefix: false, 
  shortDescription: "Shows current bot prefix and system info",
  longDescription: "Displays the active prefix, total loaded commands, and status with interactive buttons.",
  guide: "{pn}",

  execute: async (bot, msg, args, { prefix: currentPrefix }) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    
    let botUsername = config.botUsername;
    try {
      const me = await bot.getMe();
      botUsername = me.username;
    } catch (e) {
      botUsername = botUsername || "YourBotUsername";
    }

    const ownerUsername = config.ownerUsername || "YourOwnerUsername"; 
    const supportGroup = config.supportGroup || "YourSupportGroup"; 

    
    let totalCommands = 0;
    if (bot.commands) {
      totalCommands = bot.commands.size || bot.commands.length || Object.keys(bot.commands).length;
    }

    const responseText = 
`──「 👑 𝐏𝐑𝐄𝐅𝐈𝐗 𝐏𝐀𝐍𝐄𝐋 👑 」──
│
│ 💬 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐏𝐫𝐞𝐟𝐢𝐱 : [ \`${currentPrefix || "/"}\` ]
│ 📊 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 : ${totalCommands}
│ ⚡ 𝐒𝐭𝐚𝐭𝐮𝐬        : 𝐎𝐍𝐋𝐈𝐍𝐄
│
│〔 💎 𝐒𝐈𝐘𝐀𝐌 𝐁𝐎𝐓 💎 〕
╰──────────────────────`;

    return bot.sendMessage(chatId, responseText, {
      parse_mode: "Markdown",
      reply_to_message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${botUsername}?startgroup=true` },
            { text: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓", callback_data: "cmd_list" }
          ],
          [
            { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${ownerUsername}` },
            { text: "🤝 𝐒𝐔𝐏𝐏𝐎𝐑𝐓", url: `https://t.me/${supportGroup}` }
          ]
        ]
      }
    });
  }
};
