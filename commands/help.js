const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("../config");

function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error("GIF download failed"));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

module.exports = {
  name: "help",
  aliases: ["commands", "cmdlist"],
  version: "6.5",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Show all commands",
  longDescription: "Interactive command list UI for users and admins",
  category: "system",
  guide: "{pn} [command name]",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prefix = config.prefix || "/";
    const allCommands = bot.commands;

    const BOT_USERNAME = "SiyamSM_2026Bot";
    const OWNER_USERNAME = "ri_siyam";

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    const categoryFont = (str) =>
      str.split("").map(c => {
        const map = {
          A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
          I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
          Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
          Y:"𝐘",Z:"𝐙"
        };
        return map[c] || c;
      }).join("");

    const categoryEmojis = {
      system: "⚙️",
      admin: "🛠️",
      utility: "🧰",
      fun: "🎮",
      others: "📁"
    };

    if (args && args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const cmd =
        allCommands.get(cmdName) ||
        [...allCommands.values()].find(c => c.aliases?.includes(cmdName));

      if (!cmd) {
        return bot.sendMessage(
          chatId,
          `❌ **Command '${cmdName}' not found!**\nType \`${prefix}help\` to get system commands list.`,
          { reply_to_message_id: messageId, parse_mode: "Markdown", reply_markup: replyMarkup }
        );
      }

      const guideStr = cmd.guide || "{pn}";
      const usage = typeof guideStr === "string"
        ? guideStr.replace("{pn}", cmd.name)
        : cmd.name;

      const infoMsg =
`┏━━━━━━━━━━━━━┓
 🧩 𝐂𝐌𝐃 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 ✦ 𝐍𝐚𝐦𝐞     : \`${cmd.name}\`
 ✦ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬  : \`${cmd.aliases?.join(", ") || "None"}\`
 ✦ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 : ${categoryFont((cmd.category || "Others").toUpperCase())}
 ✦ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v${cmd.version || "1.0"}
 ✦ 𝐀𝐮𝐭𝐡𝐨𝐫   : ${cmd.author || "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍"}
 ✦ 𝐑𝐨𝐥𝐞     : ${cmd.role !== undefined ? cmd.role : 0}
 ✦ 𝐔𝐬𝐚𝐠𝐞    : \`${prefix}${usage}\`
━━━━━━━━━━━━━━━
 📝 ${(cmd.longDescription || cmd.shortDescription || "No detailed description available.")}`;

      return bot.sendMessage(chatId, infoMsg, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    }

    const categories = {};

    for (const [name, cmd] of allCommands) {
      const cat = cmd.category ? cmd.category.toLowerCase() : "others";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    let msgText =
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 ✍️ 𝐀𝐮𝐭𝐡𝐨𝐫   : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 🏷️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : v6.5
 🔧 𝐏𝐫𝐞𝐟𝐢𝐱   : \`${prefix}\` | 📊 **${allCommands.size}** Total Commands
━━━━━━━━━━━━━━━\n`;

    for (const cat of Object.keys(categories)) {
      const emoji = categoryEmojis[cat] || "📁";
      msgText += `\n${emoji} 『 ${categoryFont(cat.toUpperCase())} 』\n`;
      msgText += categories[cat].sort().map(c => `   ➥ \`${prefix}${c}\``).join("\n") + "\n";
    }

    msgText += `\n━━━━━━━━━━━━━━━\n💡 *Type \`${prefix}help <cmd_name>\` for command usage details.*`;

    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif"
    ];

    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "cache");

    if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });

    const gifPath = path.join(gifFolder, path.basename(randomGifURL));

    try {
      if (!fs.existsSync(gifPath)) {
        await downloadGif(randomGifURL, gifPath);
      }
      return await bot.sendAnimation(chatId, gifPath, {
        caption: msgText,
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    } catch (err) {
      return await bot.sendMessage(chatId, msgText, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    }
  }
};
