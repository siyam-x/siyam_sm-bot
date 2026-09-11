const config = require("../config");

const EMOJIS = [
  "👍", "👎", "❤️", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", "🤬", "😢", "🎉", "🤩", "🤮", "💩", "🙏", "👌", "🕊️", "🤡", "🥱", "🥴", "😍", "🐳", "❤️‍🔥", "🌚", "⚡", "🍌", "🏆", "💔", "🤨", "😐", "🍓", "🍾", "💋", "🖕", "😈", "😴", "😭", "🤓", "👻", "👨‍💻", "👀", "🎃", "🙈", "😇", "🗿", "🤪", "💌", "🌭", "👑", "💎", "🌸", "🌺", "✨", "💫", "🚀", "💥", "🎯", "🤖", "👽", "👾", "👺", "👹", "🤖", "🎃", "🦄", "🐍", "🦅", "🐝", "🍉", "🍇", "🥑", "🍔", "🍕", "🍟", "🍿", "🍩", "⚽", "🥊", "😀", "😃", "😄", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "😋", "😜", "😝", "😛", "🤑", "🤗", "🤭", "🤫", "🧐", "🤓", "😎", "🥸", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😮‍💨", "😤", "😠", "😡", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🫢", "🫡", "💀", "☠️", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸", "👶", "🧒", "👦", "👧", "🧑", "👨", "👩", "🧔", "👨‍🦰", "👩‍🦰", "👨‍🦱", "👩‍🦱", "👨‍🦳", "👩‍🦳", "👨‍🦲", "👩‍🦲", "👵", "👴", "👳", "🧕", "👮", "👷", "💂", "🕵️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🎓", "👨‍🎓", "👩‍🎤", "👨‍🎤", "👩‍🏫", "👨‍🏫", "👩‍🏭", "👨‍🏭", "👩‍💻", "👨‍💻", "👩‍💼", "👨‍💼", "👩‍🔧", "👨‍🔧", "👩‍🔬", "👨‍🔬", "👩‍🎨", "👨‍🎨", "👩‍🚒", "👨‍🚒", "👩‍✈️", "👨‍✈️", "👩‍🚀", "👨‍🚀", "👩‍⚖️", "👨‍⚖️", "👰", "🤵", "👸", "🤴", "🥷", "🦸", "🦹", "🧙", "🧝", "🧛", "🧟", "🧞", "🧜", "🧚", "🐕", "🐈", "🦁", "🐯", "🐅", "🐆", "🐴", "🐎", "🦄", "🦓", "🦌", "🐮", "🐂", "🐃", "🐄", "🐷", "🐖", "🐗", "👃", "🐏", "🐑", "🐐", "🐪", "🐫", "🦙", "🦒", "🐘", "🦣", "🦏", "🦛", "🐭", "🖱️", "🐁", "🐹", "🐰", "🐇", "🐿️", "🦫", "🦔", "🦇", "🐻", "🐨", "🐼", "🦥", "🦦", "🦨", "🦘", "🦡", "🐾"
];

module.exports = {
  name: "autoreact",
  aliases: ["autoreact", "react"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "system",
  shortDescription: "Automatically reacts to all incoming messages with random emojis",
  longDescription: "Listens to all messages in groups or private chats and sends a random emoji reaction.",
  guide: "{pn}",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    try {
      if (typeof bot.setMessageReaction === "function") {
        await bot.setMessageReaction(chatId, messageId, {
          reaction: [{ type: "emoji", emoji: randomEmoji }],
          is_big: false
        });
      } else {
        await bot._request("setMessageReaction", {
          chat_id: chatId,
          message_id: messageId,
          reaction: JSON.stringify([{ type: "emoji", emoji: randomEmoji }])
        });
      }
    } catch (err) {
      console.error("Auto React Error:", err.message);
    }

    return false;
  }
};
