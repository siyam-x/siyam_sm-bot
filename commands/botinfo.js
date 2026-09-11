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
  name: "botinfo",
  aliases: ["botinfo"],
  version: "6.3",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  shortDescription: "Show bot and owner details",
  longDescription: "Displays real bot details, owner information, and system status",
  category: "system",
  guide: "{pn}about",

  execute: async (bot, msg, args, context) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const prefix = config.prefix || "/";

    const BOT_USERNAME = "SiyamSM_2026Bot";
    const OWNER_USERNAME = "ri_siyam";
    const ownerId = config.ownerID || "8442705758";
    const userRole = context?.role !== undefined ? context.role : 0;

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

    const infoMsg =
`┏━━━━━━━━━━━━━┓
 👑 𝐁𝐎𝐓 & 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎
┗━━━━━━━━━━━━━┛
 📁 𝐅𝐢𝐥𝐞 𝐍𝐚𝐦𝐞     : \`about.js\`
 🤖 𝐁𝐨𝐭 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : \`@${BOT_USERNAME}\`
 👑 𝐎𝐰𝐧𝐞𝐫 𝐍𝐚𝐦𝐞   : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 👤 𝐎𝐰𝐧𝐞𝐫 𝐔𝐬𝐞𝐫 : \`@${OWNER_USERNAME}\`
 🆔 𝐎𝐰𝐧𝐞𝐫 𝐔𝐈𝐃    : \`${ownerId}\`
 ✍️ 𝐀𝐮𝐭𝐡𝐨𝐫       : 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
 📁 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲    : ${categoryFont("SYSTEM")}
 🏷️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧     : v6.3
 🔑 𝐘𝐨𝐮𝐫 𝐑𝐨𝐥𝐞    : ${userRole}
 🔧 𝐏𝐫𝐞𝐟𝐢𝐱       : \`${prefix}\`
━━━━━━━━━━━━━━━
 📝 ${fancyFont("This is an official bot managed by SIYAM-HASAN. Powered by high performance Telegram Bot API.")}`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "➕ 𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
          { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ],
        [
          { text: "💬 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
        ]
      ]
    };

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
        caption: infoMsg,
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    } catch (err) {
      return await bot.sendMessage(chatId, infoMsg, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    }
  }
};
