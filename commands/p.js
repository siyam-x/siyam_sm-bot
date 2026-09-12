module.exports = { 
  config: { 
    name: "p", 
    version: "3.1", 
    author: "Badhon", 
    countDown: 5, 
    role: 2, 
    category: "Admin"
  },

  langs: { 
    en: { 
      invalidNumber: "『 𝐄𝐑𝐑𝐎𝐑 』\n\n✦ %1 is not a valid number\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      cancelSuccess: "『 𝐂𝐀𝐍𝐂𝐄𝐋𝐋𝐄𝐃 』\n\n✦ Refused %1 chat(s)\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      approveSuccess: "『 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 』\n\n✦ Approved %1 chat(s)\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      cantGetPendingList: "『 𝐄𝐑𝐑𝐎𝐑 』\n\n✦ Unable to retrieve pending list\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      returnListClean: "『 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 』\n\n✦ No pending chats found\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪",
      approveAllSuccess: "『 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 𝐀𝐋𝐋 』\n\n✦ Approved ALL %1 chats\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪"
    } 
  },

  onReply: async function ({ bot, msg, Reply, getLang }) {
    if (String(msg.from.id) !== String(Reply.author)) return;

    const chatId = msg.chat.id;
    const body = msg.text ? msg.text.toLowerCase() : "";
    const isAll = body === "-all";
    const isCancel = body.startsWith("c");
    const list = isAll ? Reply.pending.map((_, i) => i + 1) : body.replace(/^c\s*/, "").split(/\s+/);

    let count = 0;

    for (const i of list) {
      const num = parseInt(i);
      if (!isAll && (isNaN(num) || num < 1 || num > Reply.pending.length)) {
        try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
        return bot.sendMessage(chatId, getLang("invalidNumber", i));
      }

      const chatItem = Reply.pending[num - 1];
      if (isCancel) {
        try {
          await bot.leaveChat(chatItem.id);
        } catch (e) {}
      } else {
        try {
          await bot.sendMessage(chatItem.id, "『 👑 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧 』\n\n✦ Bot activated successfully\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪");
        } catch (e) {}
      }
      count++;
    }

    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
    if (msg.reply_to_message) {
      try { await bot.deleteMessage(chatId, msg.reply_to_message.message_id); } catch (e) {}
    }

    const responseText = isAll ? getLang("approveAllSuccess", count)
      : isCancel ? getLang("cancelSuccess", count)
      : getLang("approveSuccess", count);

    return bot.sendMessage(chatId, responseText);
  },

  onStart: async function ({ bot, msg, getLang, commandName }) {
    const chatId = msg.chat.id;
    try {
      if (!global.telegramPendingChats) {
        global.telegramPendingChats = [];
      }

      const list = global.telegramPendingChats;

      if (!list.length)
        return bot.sendMessage(chatId, getLang("returnListClean"));

      let msgText = "『 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐋𝐈𝐒𝐓 』\n\n";
      list.forEach((g, i) => {
        msgText += `✦ ${i + 1}. ${g.title || g.id}\n`;
      });

      msgText += "\n› Reply: 1 2 - Approve\n› Reply: c 1 2 - Cancel\n› Reply: -all - Approve All\n\n➤ Owner: 𓆩👑𝐒𝐈𝐘𝐀𝐌-👑𓆪";

      try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}

      return bot.sendMessage(chatId, msgText).then((info) => {
        global.activeReplies.set(info.message_id, {
          commandName,
          author: String(msg.from.id),
          pending: list
        });
      });
    } catch {
      return bot.sendMessage(chatId, getLang("cantGetPendingList"));
    }
  }
};
