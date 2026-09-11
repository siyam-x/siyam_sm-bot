// ⚙️ আপনার বটের Username এবং Owner এর Username দিন (@ ছাড়া)
const BOT_USERNAME = "YourBotUsername"; 
const OWNER_USERNAME = "YourOwnerUsername";

module.exports = {
  name: "welcome2",
  event: "new_chat_members", // নতুন মেম্বার যুক্ত হওয়ার ইভেন্ট

  execute: async (bot, msg) => {
    try {
      const chatId = msg.chat.id;
      const newMembers = msg.new_chat_members;

      if (!newMembers || newMembers.length === 0) return;

      for (let member of newMembers) {
        // নতুন যুক্ত হওয়া মেম্বার যদি বট নিজে হয়, তবে স্কিপ করবে
        if (member.is_bot) continue;

        const name = member.first_name || "সদস্য";
        const groupTitle = msg.chat.title || "আমাদের গ্রুপে";

        const welcomeMessage = `👋 *Welcome ${name}!*

🎉 *${groupTitle}*-এ আপনাকে স্বাগতম!
❤️ আশা করি আমাদের সাথে আপনার ভালো সময় কাটবে।

📌 গ্রুপের নিয়ম মেনে চলুন এবং গঠনমূলক আলোচনায় অংশ নিন।`;

        const replyMarkup = {
          inline_keyboard: [
            [
              { text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
              { text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
            ]
          ]
        };

        await bot.sendMessage(chatId, welcomeMessage, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
          reply_markup: replyMarkup
        });
      }
    } catch (err) {
      console.error("Welcome Event Error:", err.message);
    }
  }
};
