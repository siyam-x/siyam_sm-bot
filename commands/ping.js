module.exports = {
    name: "ping",
    aliases: ["p", "test"],
    role: 0,
    execute: async (bot, msg, args, extra) => {
        const chatId = msg.chat.id;
        return bot.sendMessage(chatId, "Pong! 🏓 Bot is working perfectly.");
    }
};
