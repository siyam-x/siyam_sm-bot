module.exports = {
  name: "welcome",
  version: "1.0.0",
  author: "SIYAM-HASAN",
  category: "events",
  description: "Welcomes new members to the group",

  execute: async (bot, msg) => {
    if (!msg || !msg.new_chat_members) return;

    const chatId = msg.chat.id;
    const groupName = msg.chat.title || "আমাদের গ্রুপে";

    for (const member of msg.new_chat_members) {
      if (member.is_bot) continue;

      const firstName = member.first_name || "বন্ধু";
      const lastName = member.last_name ? ` ${member.last_name}` : "";
      const fullName = `${firstName}${lastName}`;
      const username = member.username ? `@${member.username}` : fullName;

      const welcomeMessage = 
        `👋 স্বাগতম, ${fullName}!\n\n` +
        `🎉 ${groupName} গ্রুপে আপনাকে জানাই উষ্ণ অভ্যর্থনা।\n\n` +
        `👤 ইউজার: ${username}\n` +
        `🆔 আইডি: \`${member.id}\`\n\n` +
        `আশা করি আপনার সময়টি আমাদের সাথে চমৎকার কাটবে! ✨`;

      try {
        await bot.sendMessage(chatId, welcomeMessage, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id
        });
      } catch (err) {
        console.error("Welcome Message Error:", err.message);
      }
    }
  }
};
