const axios = require("axios");

const triggerWords = [
    "baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "hi", "বট", "নিঝুম"
];

const randomResponses = [
    "বাবু খুদা লাকছে🥺",
    "Hop beda😾,Boss বল boss😼",
    "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",                      
    "naw amr boss k message daw 01789138157",
    "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
    "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
    "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
    "এটায় দেখার বাকি সিলো_🙂🙂🙂",
    "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼 😒😒",
    "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁𝗼__🥺",
    "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒",
    "__বেশি বেবি বললে কামুর দিমু 🤭🤭",
    "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
    "আমাকে ডেকো না,আমি ব্যাস্ত আসি🙆🏻‍♀",
    "𝗕𝗯𝘆 বললে চাকরি থাকবে না",
    "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, 𝆠፝𝐒𝐈𝐘𝐀𝐌,𝐒𝐈𝐘𝐀𝐌 ও তো করতে পারো😑?",
    "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
    "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
    "হটাৎ আমাকে মনে পড়লো 🙄", 
    "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿",
    "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
    "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
    "খাওয়া দাওয়া করসো 🙄",
    "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
    "আরে আমি মজা করার mood এ নাই😒",
    "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
    "আরে Bolo আমার জান, কেমন আসো? 😚",
    "একটা BF খুঁজে দাও 😿",
    "oi mama ar dakis na pilis 😿",
    "amr JaNu lagbe,Tumi ki single aso?",
    "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺",
    "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
    "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
    "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
    "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
    "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
    "ভুলে জাও আমাকে 😞😞", 
    "দেখা হলে কাঠগোলাপ দিও..🤗",
    "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺",
    "আগে একটা গান বলো, ☹ নাহলে কথা বলবো না 🥺",
    "বলো কি করতে পারি তোমার জন্য 😚",
    "কথা দেও আমাকে পটাবা...!! 😌",
    "বার বার Disturb করেছিস কোনো, আমার জানু এর সাথে ব্যাস্ত আসি 😋",
    "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺🥺",
    "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑😒",
    "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈",
    "আজকে আমার mন ভালো নেই 🙉",
    "আমি হাজারো মশার Crush😓",
    "ছেলেদের প্রতি আমার এক আকাশ পরিমান শরম🥹🫣",
    "__ফ্রী ফে'সবুক চালাই কা'রন ছেলেদের মুখ দেখা হারাম 😌",
    "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚"
];

const baseApiUrl = async () => {
    try {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
    } catch {
        return "https://hinata-api.onrender.com";
    }
};

const getBotResponse = async (text, attachments = []) => {
    try {
        const url = await baseApiUrl();
        const res = await axios.post(`${url}/api/hinata`, { text, style: 3, attachments });
        return res.data.message || "error baby🥹";
    } catch {
        return "error baby🥹";
    }
};

module.exports = {
    name: 'baby',
    version: '1.7.0',
    author: 'MahMUD & Siyam',
    description: 'Smart Simi Chatbot with Teaching functionality for Telegram',
    execute: async (bot, msg, text) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.first_name || "User";

        if (!text) {
            const randomMsg = randomResponses[Math.floor(Math.random() * randomResponses.length)];
            return bot.sendMessage(chatId, randomMsg);
        }

        const args = text.trim().split(" ");
        const subCommand = args[0].toLowerCase();

        try {
            // ১. শিখানোর কমান্ড (teach)
            if (subCommand === "teach") {
                const rawContent = text.replace(/^teach\s+/i, "");
                const [trigger, ...responsesArr] = rawContent.split(" - ");
                const responses = responsesArr.join(" - ");

                if (!trigger || !responses) {
                    return bot.sendMessage(chatId, "❌ *ফরমেট:* `/baby teach প্রশ্ন - উত্তর1, উত্তর2`", { parse_mode: 'Markdown' });
                }

                const url = await baseApiUrl();
                const response = await axios.post(`${url}/api/jan/teach`, { trigger, responses, userID: userId });
                
                return bot.sendMessage(
                    chatId, 
                    `✅ *Replies Added:*\n\n` +
                    `🔹 *Question:* "${trigger}"\n` +
                    `🔹 *Reply:* "${responses}"\n` +
                    `👤 *Teacher:* ${userName}\n` +
                    `📊 *Total:* ${response.data.count || 0}`, 
                    { parse_mode: 'Markdown' }
                );
            }

            // ২. রিমুভ করার কমান্ড (remove/rm)
            if (subCommand === "remove" || subCommand === "rm") {
                const rawContent = text.replace(/^(remove|rm)\s+/i, "");
                const [trigger, index] = rawContent.split(" - ");

                if (!trigger || !index || isNaN(index)) {
                    return bot.sendMessage(chatId, "❌ *ফরমেট:* `/baby remove প্রশ্ন - ইনডেক্স নম্বর`", { parse_mode: 'Markdown' });
                }

                const url = await baseApiUrl();
                const response = await axios.delete(`${url}/api/jan/remove`, { data: { trigger, index: parseInt(index, 10) } });
                return bot.sendMessage(chatId, response.data.message || "✅ Successfully removed!");
            }

            // ৩. লিস্ট বের করার কমান্ড (list/list all)
            if (subCommand === "list") {
                const isAll = args[1] && args[1].toLowerCase() === "all";
                const endpoint = isAll ? "/list/all" : "/list";
                const url = await baseApiUrl();
                const response = await axios.get(`${url}/api/jan${endpoint}`);

                if (isAll && response.data && response.data.data) {
                    let listMessage = "👑 *List of Baby Teachers:*\n\n";
                    const data = Object.entries(response.data.data).sort((a, b) => b[1] - a[1]).slice(0, 50);
                    data.forEach(([uid, count], i) => {
                        listMessage += `${i + 1}. User ID \`${uid}\`: ${count}\n`;
                    });
                    return bot.sendMessage(chatId, listMessage, { parse_mode: 'Markdown' });
                }

                return bot.sendMessage(chatId, response.data.message || "No list data found.");
            }

            // ৪. এডিট করার কমান্ড (edit)
            if (subCommand === "edit") {
                const rawContent = text.replace(/^edit\s+/i, "");
                const [oldTrigger, ...newArr] = rawContent.split(" - ");
                const newResponse = newArr.join(" - ");

                if (!oldTrigger || !newResponse) {
                    return bot.sendMessage(chatId, "❌ *ফরমেট:* `/baby edit পুরোনো_প্রশ্ন - নতুন_উত্তর`", { parse_mode: 'Markdown' });
                }

                const url = await baseApiUrl();
                await axios.put(`${url}/api/jan/edit`, { oldTrigger, newResponse });
                return bot.sendMessage(chatId, `✅ Edited "${oldTrigger}" to "${newResponse}"`);
            }

            // ৫. মেসেজ খোঁজার কমান্ড (msg)
            if (subCommand === "msg") {
                const searchTrigger = args.slice(1).join(" ");
                if (!searchTrigger) return bot.sendMessage(chatId, "❌ খোঁজার জন্য প্রশ্ন লিখুন।");

                const url = await baseApiUrl();
                const response = await axios.get(`${url}/api/jan/msg`, { params: { userMessage: `msg ${searchTrigger}` } });
                return bot.sendMessage(chatId, response.data.message || "No message found.");
            }

            // ৬. সাধারণ চ্যাট রেসপন্স
            let userText = text;
            for (const prefix of triggerWords) {
                if (text.toLowerCase().startsWith(prefix)) {
                    userText = text.substring(prefix.length).trim();
                    break;
                }
            }

            if (!userText) {
                const randomMsg = randomResponses[Math.floor(Math.random() * randomResponses.length)];
                return bot.sendMessage(chatId, randomMsg);
            }

            const botReply = await getBotResponse(userText);
            return bot.sendMessage(chatId, botReply);

        } catch (err) {
            console.error('Baby Bot Error:', err.message);
            bot.sendMessage(chatId, "❌ সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন!");
        }
    }
};
