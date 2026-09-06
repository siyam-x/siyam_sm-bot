const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "cmd",
    version: "2.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    category: "admin",
    description: "Manage command files (load, reload, install)",
    adminOnly: true,

    execute: async (bot, msg, argsText) => {
        const chatId = msg.chat.id;
        const args = argsText ? argsText.trim().split(/ +/) : [];
        const subCommand = args[0] ? args[0].toLowerCase() : "";

        const commandsDir = path.join(__dirname);

        // ১. Single Command Load/Reload
        if (subCommand === "load") {
            const fileName = args[1];
            if (!fileName) {
                return bot.sendMessage(chatId, "⚠️ *অনুগ্রহ করে কমান্ড ফাইলের নাম দিন! (যেমন: /cmd load ai.js)*", { parse_mode: 'Markdown' });
            }

            const cleanFileName = fileName.endsWith('.js') ? fileName : `${fileName}.js`;
            const filePath = path.join(commandsDir, cleanFileName);

            if (!fs.existsSync(filePath)) {
                return bot.sendMessage(chatId, `❌ *'${cleanFileName}' নামের কোনো ফাইল পাওয়া যায়নি!*`, { parse_mode: 'Markdown' });
            }

            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                if (command.name && typeof command.execute === 'function') {
                    bot.commands.set(command.name, command);
                    return bot.sendMessage(chatId, `✅ *'${command.name}' (\`${cleanFileName}\`) কমান্ড সফলভাবে রিলোড হয়েছে!*`, { parse_mode: 'Markdown' });
                } else {
                    throw new Error("Invalid command structure");
                }
            } catch (err) {
                return bot.sendMessage(chatId, `❌ *ফাইল লোড করতে সমস্যা হয়েছে:*\n\`${err.message}\``, { parse_mode: 'Markdown' });
            }
        }

        // ২. Load All Commands
        if (subCommand === "loadall" || subCommand === "load-all") {
            try {
                const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
                let successCount = 0;
                let failCount = 0;

                for (const file of files) {
                    const filePath = path.join(commandsDir, file);
                    delete require.cache[require.resolve(filePath)];
                    try {
                        const command = require(filePath);
                        if (command.name && typeof command.execute === 'function') {
                            bot.commands.set(command.name, command);
                            successCount++;
                        }
                    } catch (e) {
                        failCount++;
                    }
                }

                return bot.sendMessage(
                    chatId,
                    `✅ *মোট ${successCount} টি কমান্ড সফলভাবে লোড হয়েছে!*` + (failCount > 0 ? `\n❌ *${failCount} টি কমান্ড ফেল করেছে।*` : ""),
                    { parse_mode: 'Markdown' }
                );
            } catch (err) {
                return bot.sendMessage(chatId, `❌ *কমান্ড লোড করতে ব্যর্থ হয়েছে: ${err.message}*`, { parse_mode: 'Markdown' });
            }
        }

        // ৩. Install Command from Raw URL
        if (subCommand === "install") {
            let url = args[1];
            let fileName = args[2];

            if (!url || !fileName) {
                return bot.sendMessage(
                    chatId,
                    "⚠️ *সঠিক ফরম্যাট ব্যবহার করুন:*\n`/cmd install <Raw_URL> <file_name.js>`",
                    { parse_mode: 'Markdown' }
                );
            }

            if (!fileName.endsWith('.js')) fileName += '.js';

            if (url.includes("pastebin.com") && !url.includes("/raw/")) {
                url = url.replace("pastebin.com/", "pastebin.com/raw/");
            } else if (url.includes("github.com") && url.includes("/blob/")) {
                url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
            }

            const loadingMsg = await bot.sendMessage(chatId, "⏳ *কমান্ড কোড ডাউনলোড ও টেস্ট করা হচ্ছে...*", { parse_mode: 'Markdown' });

            try {
                const res = await axios.get(url);
                const code = res.data;

                if (!code || typeof code !== 'string') {
                    throw new Error("URL থেকে কোনো ভ্যালিড কোড পাওয়া যায়নি!");
                }

                const filePath = path.join(commandsDir, fileName);
                fs.writeFileSync(filePath, code);

                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if (command.name && typeof command.execute === 'function') {
                    bot.commands.set(command.name, command);
                    return bot.editMessageText(
                        `✅ *'${command.name}' কমান্ড ইনস্টল ও লোড সফল হয়েছে!*\n📁 ফাইল: \`${fileName}\``,
                        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: 'Markdown' }
                    );
                } else {
                    fs.unlinkSync(filePath); // কোড ভুল থাকলে ফাইল ফেলে দেবে
                    throw new Error("কমান্ড ফাইলের স্ট্রাকচার সঠিক নয় (name বা execute অনুপস্থিত)।");
                }

            } catch (err) {
                return bot.editMessageText(
                    `❌ *কমান্ড ইনস্টল ব্যর্থ হয়েছে:*\n\`${err.message}\``,
                    { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: 'Markdown' }
                );
            }
        }

        // গাইডলাইন হেল্প মেসেজ
        return bot.sendMessage(
            chatId,
            `⚙️ *CMD Manager Help*\n━━━━━━━━━━━━━━━\n` +
            `🔹 \`/cmd load <file.js>\` - নির্দিষ্ট ফাইল রিলোড করুন\n` +
            `🔹 \`/cmd loadall\` - সব কমান্ড একসাথে রিফ্রেশ করুন\n` +
            `🔹 \`/cmd install <URL> <file.js>\` - ইউআরএল থেকে কমান্ড ইনস্টল করুন`,
            { parse_mode: 'Markdown' }
        );
    }
};
