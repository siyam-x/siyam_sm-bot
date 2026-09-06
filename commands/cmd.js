const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "cmd",
    version: "2.6.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    category: "admin",
    description: "Advanced command manager with clean code execution",
    adminOnly: true,

    execute: async (bot, msg, argsText) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const args = argsText ? argsText.trim().split(/ +/) : [];
        const subCommand = args[0] ? args[0].toLowerCase() : "";

        const commandsDir = path.join(__dirname);

        const registerCommand = (command) => {
            bot.commands.set(command.name, command);
            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => {
                    if (bot.aliases) bot.aliases.set(alias, command.name);
                });
            }
        };

        if (subCommand === "load") {
            const fileName = args[1];
            if (!fileName) {
                return bot.sendMessage(chatId, "⚠️ অনুগ্রহ করে কমান্ড ফাইলের নাম দিন! (যেমন: /cmd load ai.js)", { reply_to_message_id: messageId });
            }

            const cleanFileName = fileName.endsWith('.js') ? fileName : `${fileName}.js`;
            const filePath = path.join(commandsDir, cleanFileName);

            if (!fs.existsSync(filePath)) {
                return bot.sendMessage(chatId, `❌ '${cleanFileName}' নামের কোনো ফাইল পাওয়া যায়নি!`, { reply_to_message_id: messageId });
            }

            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                if (command.name && typeof command.execute === 'function') {
                    registerCommand(command);
                    return bot.sendMessage(chatId, `✅ '${command.name}' (${cleanFileName}) কমান্ড সফলভাবে রিলোড হয়েছে!`, { reply_to_message_id: messageId });
                } else {
                    throw new Error("Invalid command structure (name or execute missing)");
                }
            } catch (err) {
                return bot.sendMessage(chatId, `❌ ফাইল লোড করতে সমস্যা হয়েছে:\n${err.message}`, { reply_to_message_id: messageId });
            }
        }

        if (subCommand === "loadall" || subCommand === "load-all") {
            try {
                const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
                let successCount = 0;
                let failedFiles = [];

                for (const file of files) {
                    const filePath = path.join(commandsDir, file);
                    delete require.cache[require.resolve(filePath)];
                    try {
                        const command = require(filePath);
                        if (command.name && typeof command.execute === 'function') {
                            registerCommand(command);
                            successCount++;
                        } else {
                            failedFiles.push({ file, reason: "Invalid Structure" });
                        }
                    } catch (e) {
                        failedFiles.push({ file, reason: e.message });
                    }
                }

                let responseMsg = `✅ মোট ${successCount} টি কমান্ড সফলভাবে লোড হয়েছে!`;

                if (failedFiles.length > 0) {
                    responseMsg += `\n\n❌ ${failedFiles.length} টি কমান্ড লোড হতে ব্যর্থ হয়েছে:`;
                    failedFiles.forEach(item => {
                        responseMsg += `\n• ${item.file} ➔ ${item.reason}`;
                    });
                }

                return bot.sendMessage(chatId, responseMsg, { reply_to_message_id: messageId });
            } catch (err) {
                return bot.sendMessage(chatId, `❌ কমান্ড ডিরেক্টরি স্ক্যান করতে ব্যর্থ হয়েছে: ${err.message}`, { reply_to_message_id: messageId });
            }
        }

        if (subCommand === "install") {
            const firstParam = args[1];
            
            if (!firstParam) {
                return bot.sendMessage(
                    chatId,
                    "⚠️ ইনস্টল করার সঠিক নিয়ম:\n\n1. URL থেকে: /cmd install <URL> <file_name.js>\n2. সরাসরি কোড দিয়ে:\n/cmd install <file_name.js>\nmodule.exports = { ... }",
                    { reply_to_message_id: messageId }
                );
            }

            let fileName = "";
            let codeContent = "";

            if (firstParam.endsWith('.js') || (!firstParam.startsWith('http://') && !firstParam.startsWith('https://'))) {
                fileName = firstParam.endsWith('.js') ? firstParam : `${firstParam}.js`;
                
                const codeStartIndex = argsText.indexOf(args[1]) + args[1].length;
                codeContent = argsText.substring(codeStartIndex).trim();

                codeContent = codeContent.replace(/^```(javascript|js)?\n?/, '').replace(/\n?```$/, '').trim();

                if (!codeContent) {
                    return bot.sendMessage(
                        chatId,
                        `⚠️ ফাইল নাম '${fileName}' দিয়েছেন কিন্তু কোনো কোড পেস্ট করেননি!`,
                        { reply_to_message_id: messageId }
                    );
                }
            } else {
                let url = firstParam;
                fileName = args[2];

                if (!fileName) {
                    return bot.sendMessage(chatId, "⚠️ URL এর পাশে ফাইলের নাম লিখুন! (যেমন: /cmd install <URL> owner.js)", { reply_to_message_id: messageId });
                }

                if (!fileName.endsWith('.js')) fileName += '.js';

                if (url.includes("pastebin.com") && !url.includes("/raw/")) {
                    url = url.replace("pastebin.com/", "pastebin.com/raw/");
                } else if (url.includes("github.com") && url.includes("/blob/")) {
                    url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
                }

                const loadingMsg = await bot.sendMessage(chatId, "⏳ URL থেকে কোড ডাউনলোড করা হচ্ছে...", { reply_to_message_id: messageId });

                try {
                    const res = await axios.get(url);
                    codeContent = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data;
                    await bot.deleteMessage(chatId, loadingMsg.message_id);
                } catch (err) {
                    return bot.sendMessage(chatId, `❌ URL থেকে ডাউনলোড করতে ব্যর্থ হয়েছে: ${err.message}`, { reply_to_message_id: messageId });
                }
            }

            const filePath = path.join(commandsDir, fileName);

            try {
                fs.writeFileSync(filePath, codeContent, 'utf8');

                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if (command.name && typeof command.execute === 'function') {
                    registerCommand(command);
                    return bot.sendMessage(
                        chatId,
                        `✅ '${command.name}' (${fileName}) সফলভাবে ইনস্টল ও লোড হয়েছে!`,
                        { reply_to_message_id: messageId }
                    );
                } else {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    throw new Error("কমান্ড ফাইলের স্ট্রাকচার সঠিক নয় (name অথবা execute অনুপস্থিত)।");
                }

            } catch (err) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return bot.sendMessage(
                    chatId,
                    `❌ কমান্ড ইনস্টল ব্যর্থ হয়েছে!\nএরর: ${err.message}`,
                    { reply_to_message_id: messageId }
                );
            }
        }

        return bot.sendMessage(
            chatId,
            `⚙️ Advanced CMD Manager\n━━━━━━━━━━━━━━━━\n` +
            `🔹 /cmd load <file.js> - ফাইল রিলোড করুন\n` +
            `🔹 /cmd loadall - সব ফাইল একসাথে রিফ্রেশ ও রিপোর্ট দেখুন\n` +
            `🔹 /cmd install <file.js> [কোড] - সরাসরি কোড পেস্ট করে ইন্সটল\n` +
            `🔹 /cmd install <URL> <file.js> - লিংক থেকে কোড ইন্সটল`,
            { reply_to_message_id: messageId }
        );
    }
};
