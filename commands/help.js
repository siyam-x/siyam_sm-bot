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
  aliases: ["commands"],
  version: "6.3",
  author: "EryXenX",
  role: 0,
  shortDescription: "Show all commands",
  longDescription: "Show all commands in clean UI",
  category: "system",
  guide: "{pn}help [command name]",

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prefix = config.prefix || "/";
    const allCommands = bot.commands;

    const BOT_USERNAME = "YourBotUsername"; 
    const OWNER_USERNAME = "YourOwnerUsername";

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

    const fancyFont = (str) =>
      str.replace(/[A-Za-z]/g, (c) => {
        const map = {
          A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
          I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
          Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
          Y:"𝐘",Z:"𝐙",
          a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",
          i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",
          q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"🇺",v:"𝐯",w:"𝐰",x:"𝐱",
          y:"𝐲",z:"𝐳"
        };
        return map[c] || c;
      });

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

    const cleanCategoryName = (text) => text ? text.toLowerCase() : "others";

    const categoryEmojis = {
      system: "⚙️",
      economy: "💰",
      moderation: "🛡️",
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
          `❌ ${fancyFont(`Command '${cmdName}' not found!`)}\n➤ Try ${prefix}help to see full list`,
          { reply_to_message_id: messageId, reply_markup: replyMarkup }
        );
      }

      const guideStr = cmd.guide || "{pn}help [command name]";
      const usage = typeof guideStr === "string"
        ? guideStr.replace("{pn}", cmd.name)
        : cmd.name;

      const infoMsg =
`┏━━━━━━━━━━━━━┓
 🧩 𝐂𝐌𝐃 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 ✦ Name     : \`${cmd.name}\`
 ✦ Aliases  : \`${cmd.aliases?.join(", ") || "None"}\`
 ✦ Category : ${categoryFont((cmd.category || "Others").toUpperCase())}
 ✦ Version  : v${cmd.version || "1.0"}
 ✦ Author   : ${cmd.author || "Unknown"}
 ✦ Usage    : \`${prefix}${usage}\`
━━━━━━━━━━━━━━━
 📝 ${(cmd.longDescription || cmd.shortDescription || "No description")}`;

      return bot.sendMessage(chatId, infoMsg, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    }

    const categories = {};

    for (const [name, cmd] of allCommands) {
      const cat = cleanCategoryName(cmd.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    const formatCommands = (cmds) =>
      cmds.sort().map(c => `    ➥ \`${prefix}${c}\``).join("\n");

    let msgText =
`┏━━━━━━━━━━━━━┓
 📜 𝐂𝐌𝐃 𝐇𝐔𝐁
┗━━━━━━━━━━━━━┛
 🔧 \`${prefix}\` | 📊 ${allCommands.size} cmds
━━━━━━━━━━━━━━━\n`;

    for (const cat of Object.keys(categories)) {
      const emoji = categoryEmojis[cat] || "📁";
      msgText += `\n${emoji} 『 ${categoryFont(cat.toUpperCase())} 』 ✦ ${categories[cat].length}\n`;
      msgText += formatCommands(categories[cat]) + "\n";
    }

    msgText += `\n━━━━━━━━━━━━━━━\n✨ \`${prefix}help <command>\``;

    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif",
      "https://i.imgur.com/KQBcxOV.gif"
    ];

    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "cache");

    if (!fs.existsSync(gifFolder))
      fs.mkdirSync(gifFolder, { recursive: true });

    const gifName = path.basename(randomGifURL);
    const gifPath = path.join(gifFolder, gifName);

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
