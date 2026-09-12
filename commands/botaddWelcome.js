const { createWriteStream } = require("fs-extra");
const path = require("path");
const axios = require("axios");

const botJoinImages = [
    "https://i.imgur.com/y5a5BBP.jpeg",
    "https://i.imgur.com/586Aq55.jpeg"
];

module.exports = {
    config: {
        name: "botaddWelcome",
        version: "1.0",
        author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
        category: "events"
    },

    onStart: async function ({ bot, msg }) {
        try {
            const chatId = msg.chat.id;
            const chatType = msg.chat.type;

            if (chatType !== "group" && chatType !== "supergroup") return;

            const newMembers = msg.new_chat_members || [];
            const botInfo = await bot.getMe();
            const isBotAdded = newMembers.some(member => member.id === botInfo.id);

            if (!isBotAdded) return;

            const chatTitle = msg.chat.title || "Group";
            
            let memberCount = "Unknown";
            try {
                memberCount = await bot.getChatMembersCount(chatId);
            } catch (e) {}

            let imageStream = null;
            let tempImagePath = null;

            try {
                const randomImgUrl = botJoinImages[Math.floor(Math.random() * botJoinImages.length)];
                const response = await axios.get(randomImgUrl, { responseType: "arraybuffer" });
                
                const tempDir = path.join(__dirname, "../temp");
                const fs = require("fs-extra");
                await fs.ensureDir(tempDir);
                
                tempImagePath = path.join(tempDir, `bot_join_${Date.now()}.jpeg`);
                await fs.writeFile(tempImagePath, Buffer.from(response.data));
                
                imageStream = require("fs").createReadStream(tempImagePath);
            } catch (imgError) {}

            const welcomeText = `✨ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✨\n──────────────────\n👋 হ্যালো BOT EXPOSED 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 \n\n🤖 আমি 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧\n❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ\n\n──────────────────\n📌 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢\n» 👥 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 : ${memberCount}\n» 💬 𝗚𝗥𝗢𝗨𝗣 : ${chatTitle}\n» 🤖 𝗣𝗥𝗘𝗙𝗜𝗫 : { , }\n\n──────────────────\n📖 𝗚𝗘𝗧 𝗦𝗧𝗔𝗥𝗧𝗘𝗗\n» /help — সকল কমান্ড দেখুন\n» call আপনার সমস্যা লেখুন\n» 📞 +𝟴𝟴𝟬𝟭𝟴𝟵𝟭𝟯𝟴𝟭𝟱𝟳\n─────────────────\n👑 𝗢𝗪𝗡𝗘𝗥 : 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n\n🌸 সবাইকে স্বাগতম`;

            if (imageStream) {
                await bot.sendPhoto(chatId, imageStream, { caption: welcomeText });
            } else {
                await bot.sendMessage(chatId, welcomeText);
            }

            if (tempImagePath) {
                setTimeout(() => {
                    const fs = require("fs-extra");
                    if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
                }, 5000);
            }

        } catch (error) {}
    }
};
