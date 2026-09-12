const { writeFileSync } = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "admin",
    aliases: ["operator", "nimda"],
    version: "3.5",
    author: "亗 SIYAM HASAN 亗",
    countDown: 5,
    role: 0
  },

  onStart: async function ({ bot, msg, args, usersData }) {
    const chatId = msg.chat.id;
    const senderID = msg.from.id;
    const configPath = path.join(__dirname, "../config.json");
    const config = require(configPath);

    if (!config.adminIDs) {
      config.adminIDs = [config.ownerID];
    }

    const isOwner = String(senderID) === String(config.ownerID) || config.adminIDs.map(String).includes(String(senderID));

    if (args[0] == "add" || args[0] == "-a") {
      if (!isOwner) {
        return bot.sendMessage(chatId, `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗\n» ⚠️ 𝗢𝗡𝗟𝗬 𝗦𝗜𝗬𝗔𝗠 𝗢𝗪𝗡𝗘𝗥 \n» ✅ 𝗖𝗔𝗡 𝗔𝗗𝗗 𝗡𝗘𝗪 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥!\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
      }

      let uids = [];
      if (msg.reply_to_message && msg.reply_to_message.from) {
        uids.push(String(msg.reply_to_message.from.id));
      } else {
        uids = args.slice(1).filter(uid => !isNaN(uid));
      }

      if (!uids.length) {
        return bot.sendMessage(chatId, `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 📌 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗨𝗦𝗘𝗥\n» ⚠️ 𝗥𝗲𝗽𝗹𝘆 / 𝗨𝗜𝗗 𝗡𝗲𝗲𝗱𝗲𝗱\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
      }

      const addedUsers = [];
      const alreadyUsers = [];

      for (const uid of uids) {
        if (config.adminIDs.map(String).includes(String(uid))) {
          alreadyUsers.push(uid);
        } else {
          config.adminIDs.push(Number(uid) || uid);
          addedUsers.push(uid);
        }
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2));

      let msgText = "";
      for (const uid of uids) {
        let name = "𝗔𝗗𝗠𝗜𝗡🛡️";
        try {
          const member = await bot.getChatMember(chatId, uid);
          name = member.user.first_name || "𝗔𝗗𝗠𝗜𝗡🛡️";
        } catch (e) {}

        if (addedUsers.includes(uid)) {
          msgText += `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 🎉 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥 𝗔𝗗𝗗𝗘𝗗\n» ⚜️ 𝗡𝗔𝗠𝗘 : ${name}\n» 🆔 𝗨𝗜𝗗  : ${uid}\n» 💠 𝗥𝗔𝗡𝗞 : 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿\n» 🥂 𝗦𝗧𝗔𝗧𝗨𝗦 : 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 𝗔𝗗𝗗𝗘𝗗\n» 💎 𝗔𝗖𝗖𝗘𝗦𝗦 : 𝗙𝗨𝗟𝗟 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡𝗦\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧\n\n`;
        } else {
          msgText += `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥\n» 👤 𝗡𝗔𝗠𝗘 : ${name}\n» 🆔 𝗨𝗜𝗗  : ${uid}\n» 💎 𝗔𝗕𝗢𝗨𝗧 : 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧\n\n`;
        }
      }

      return bot.sendMessage(chatId, msgText.trim());
    }

    if (args[0] == "remove" || args[0] == "-r") {
      if (!isOwner) {
        return bot.sendMessage(chatId, `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗\n» ⚠️ 𝗢𝗻𝗹𝘆 𝗦𝗜𝗬𝐀𝗠 𝗢𝘄𝗻𝗲𝗿 \n» 👑 𝗖𝗮𝗻 𝗥𝗲𝗺𝗼𝘃𝗲 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿!\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
      }

      let uids = [];
      if (msg.reply_to_message && msg.reply_to_message.from) {
        uids.push(String(msg.reply_to_message.from.id));
      } else {
        uids = args.slice(1).filter(uid => !isNaN(uid));
      }

      if (!uids.length) {
        return bot.sendMessage(chatId, `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 🔍 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗨𝗦𝗘𝗥\n» ⚠️ 𝗥𝗲𝗽𝗹𝘆 / 𝗨𝗜𝗗 𝗡𝗲𝗲𝗱𝗲𝗱\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
      }

      const removedUsers = [];
      const notUsers = [];

      for (const uid of uids) {
        const index = config.adminIDs.map(String).indexOf(String(uid));
        if (index !== -1) {
          config.adminIDs.splice(index, 1);
          removedUsers.push(uid);
        } else {
          notUsers.push(uid);
        }
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2));

      let msgText = "";
      for (const uid of uids) {
        let name = "𝗔𝗗𝗠𝗜𝗡";
        try {
          const member = await bot.getChatMember(chatId, uid);
          name = member.user.first_name || "𝗔𝗗𝗠𝗜𝗡";
        } catch (e) {}

        if (removedUsers.includes(uid)) {
          msgText += `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ❌ 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥 𝗥𝗘𝗠𝗢𝗩𝗘𝗗\n» ⚜️ 𝗡𝗔𝗠𝗘 : ${name}\n» 🆔 𝗨𝗜𝗗  : ${uid}\n» 💠 𝗥𝗔𝗡𝗞 : 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿\n» 💔 𝗦𝗧𝗔𝗧𝗨𝗦 : 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝗬\n» 🔒 𝗔𝗖𝗖𝗘𝗦𝗦 : 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝗖𝗹𝗼𝘀𝗲𝗱\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧\n\n`;
        } else {
          msgText += `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝗡𝗢𝗧 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥\n» 👤 𝗡𝗔𝗠𝗘 : ${name}\n» 🆔 𝗨𝗜𝗗  : ${uid}\n» ❌ 𝗡𝗼𝘁 𝗜𝗻 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿 𝗟𝗶𝘀𝘁 ⛔\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧\n\n`;
        }
      }

      return bot.sendMessage(chatId, msgText.trim());
    }

    if (args[0] == "list" || args[0] == "-l") {
      const validAdminUIDs = (config.adminIDs || []).filter(uid => uid && String(uid).trim() !== "");

      let listText = "";
      for (let i = 0; i < validAdminUIDs.length; i++) {
        const uid = validAdminUIDs[i];
        let displayName = "𝗔𝗗𝗠𝗜𝗡";
        try {
          const member = await bot.getChatMember(chatId, uid);
          displayName = member.user.first_name || "𝗔𝗗𝗠𝗜𝗡";
        } catch (e) {}

        listText += `» ${i + 1}. 👑 ${displayName}\n» 🆔 𝗨𝗜𝗗: ${uid}\n───────────────\n`;
      }

      return bot.sendMessage(chatId, `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚙️ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥 𝗟𝗜𝗦𝗧\n───────────────\n${listText.trim() || "» ❌ 𝗡𝗢 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥𝗦 𝗙𝗢𝗨𝗡𝗗 📭"}\n───────────────\n» 🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
    }

    return bot.sendMessage(chatId, "Invalid usage! Use: admin2 add/remove/list");
  }
};
