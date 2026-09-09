const axios = require("axios");

const triggerWords = [
    "baby", "bby", "babu", "bbu", "jan", "bot", 
    "জান", "জানু", "বেবি", "hi", "বট", "নিঝুম"
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports = {
    name: 'baby',
    version: '1.7',
    author: 'Siyam Hasan',
    description: 'AI Chatbot with Teach and Response feature',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const uid = msg.from.id;
        const text = args ? args.trim() : "";

        const actionButtons = {
            inline_keyboard: [
                [
                    { text: '➕ Add To Group', url: 'https://t.me/ri_siyam?startgroup=true' },
                    { text: '👑 Contact Owner', url: 'https://t.me/ri_siyam' }
                ]
            ]
        };

        try {
            if (!text) {
                const randomGreeting = ["Bolo baby 😚", "I love you 🙈", "কিছু একটা লিখে মেসেজ দাও!"];
                const replyText = randomGreeting[Math.floor(Math.random() * randomGreeting.length)];
                return await bot.sendMessage(chatId, replyText, { reply_markup: actionButtons });
            }

            const inputParts = text.split(" ");
            const command = inputParts[0].toLowerCase();

            if (command === "teach") {
                const cleanStr = text.replace(/^teach\s+/i, "");
                const [trigger, ...responsesArr] = cleanStr.split(" - ");
                const responses = responsesArr.join(" - ");

                if (!trigger || !responses) {
                    return await bot.sendMessage(chatId, "❌ নিয়ম: `/baby teach প্রশ্ন - উত্তর১, উত্তর২`", { parse_mode: 'Markdown' });
                }

                const baseUrl = await baseApiUrl();
                const response = await axios.post(`${baseUrl}/api/jan/teach`, { trigger, responses, userID: uid });
                const userName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

                return await bot.sendMessage(
                    chatId,
                    `✅ *Replies Added!*\n• *Trigger:* ${trigger}\n• *Response:* ${responses}\n• *Teacher:* ${userName}\n• *Total:* ${response.data.count || 0}`,
                    { parse_mode: 'Markdown', reply_markup: actionButtons }
                );
            }

            if (command === "remove" || command === "rm") {
                const cleanStr = text.replace(/^(remove|rm)\s+/i, "");
                const [trigger, index] = cleanStr.split(" - ");

                if (!trigger || !index || isNaN(index)) {
                    return await bot.sendMessage(chatId, "❌ নিয়ম: `/baby remove প্রশ্ন - ইনডেক্স_নম্বর`", { parse_mode: 'Markdown' });
                }

                const baseUrl = await baseApiUrl();
                const response = await axios.delete(`${baseUrl}/api/jan/remove`, {
                    data: { trigger, index: parseInt(index, 10) }
                });

                return await bot.sendMessage(chatId, response.data.message || "✅ সফলভাবে রিমুভ করা হয়েছে!", { reply_markup: actionButtons });
            }

            if (command === "list") {
                const isAll = inputParts[1] === "all";
                const endpoint = isAll ? "/list/all" : "/list";
                const baseUrl = await baseApiUrl();
                const response = await axios.get(`${baseUrl}/api/jan${endpoint}`);

                if (isAll && response.data?.data) {
                    let listMsg = "👑 *Top Teachers List:*\n\n";
                    const data = Object.entries(response.data.data).sort((a, b) => b[1] - a[1]).slice(0, 20);
                    
                    data.forEach(([userID, count], index) => {
                        listMsg += `${index + 1}. ID \`${userID}\`: ${count} answers\n`;
                    });

                    return await bot.sendMessage(chatId, listMsg, { parse_mode: 'Markdown', reply_markup: actionButtons });
                }

                return await bot.sendMessage(chatId, response.data.message || "কোনো তথ্য পাওয়া যায়নি।", { reply_markup: actionButtons });
            }

            if (command === "edit") {
                const cleanStr = text.replace(/^edit\s+/i, "");
                const [oldTrigger, ...newArr] = cleanStr.split(" - ");
                const newResponse = newArr.join(" - ");

                if (!oldTrigger || !newResponse) {
                    return await bot.sendMessage(chatId, "❌ নিয়ম: `/baby edit পুরাতন_প্রশ্ন - নতুন_উত্তর`", { parse_mode: 'Markdown' });
                }

                const baseUrl = await baseApiUrl();
                await axios.put(`${baseUrl}/api/jan/edit`, { oldTrigger, newResponse });

                return await bot.sendMessage(chatId, `✅ Edited "${oldTrigger}" to "${newResponse}"`, { reply_markup: actionButtons });
            }

            let photoUrl = null;
            if (msg.reply_to_message && msg.reply_to_message.photo) {
                const photoId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
                photoUrl = await bot.getFileLink(photoId);
            } else if (msg.photo) {
                const photoId = msg.photo[msg.photo.length - 1].file_id;
                photoUrl = await bot.getFileLink(photoId);
            }

            const baseUrl = await baseApiUrl();
            const res = await axios.post(`${baseUrl}/api/hinata`, {
                text: text,
                style: 3,
                attachments: photoUrl ? [photoUrl] : []
            });

            const replyText = res.data.message || "error baby🥹";

            await bot.sendMessage(chatId, replyText, {
                reply_to_message_id: msg.message_id,
                reply_markup: actionButtons
            });

        } catch (error) {
            console.error('Baby Error:', error.message);
            await bot.sendMessage(chatId, "❌ সার্ভারে সমস্যা হয়েছে, পরে চেষ্টা করুন!", { reply_markup: actionButtons });
        }
    }
};
