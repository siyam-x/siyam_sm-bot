const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

const COMMANDS_DIR = path.join(__dirname);

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    name: "cmd",
    aliases: ["command", "cmds"],
    version: "3.0.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2, // Admin Only
    category: "admin",
    shortDescription: "Dynamic Command Manager",
    longDescription: "Manage, reload, unload, and install commands with error detection.",
    guide: "{pn} load <filename>\n{pn} unload <filename>\n{pn} loadall\n{pn} install <url> <filename.js>",

    execute: async (bot, msg, argsText) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const args = Array.isArray(argsText) ? argsText : (argsText ? argsText.trim().split(/\s+/) : []);

        const botUsername = config.botUsername || "SiyamSM_2026Bot";
        const ownerUsername = config.ownerUsername || "ri_siyam";

        const defaultButtons = [
            [
                { text: "🔄 Load All Commands", callback_data: "cmd_loadall" },
                { text: "📜 Command List", callback_data: "cmd_list" }
            ],
            [
                { text: "➕ ADD GROUP", url: `https://t.me/${botUsername}?startgroup=true` },
                { text: "👑 OWNER", url: `https://t.me/${ownerUsername}` }
            ]
        ];

        if (!args.length) {
            return bot.sendMessage(
                chatId,
                "🛠 **Command Manager Dashboard**\n\nনিচের বাটন চেপে ডায়নামিক মেসেজ ডায়ালগ ব্যবহার করুন অথবা টাইপ করুন:\n• `/cmd load <filename>`\n• `/cmd unload <filename>`\n• `/cmd loadall`\n• `/cmd install <url> <filename.js>`",
                {
                    reply_to_message_id: messageId,
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: defaultButtons }
                }
            );
        }

        const action = args[0].toLowerCase();

        if (action === "loadall") {
            return module.exports.handleLoadAll(bot, chatId, messageId);
        }

        if (action === "load") {
            const fileName = args[1];
            if (!fileName) return bot.sendMessage(chatId, "⚠️ ফাইল বা কমান্ডের নাম দিন।", { reply_to_message_id: messageId });
            return module.exports.handleLoad(bot, chatId, messageId, fileName);
        }

        if (action === "unload") {
            const fileName = args[1];
            if (!fileName) return bot.sendMessage(chatId, "⚠️ ফাইল বা কমান্ডের নাম দিন।", { reply_to_message_id: messageId });
            return module.exports.handleUnload(bot, chatId, messageId, fileName);
        }

        if (action === "install") {
            let url = args[1];
            let fileName = args[2];

            if (!url || !fileName) return bot.sendMessage(chatId, "⚠️ সঠিক নিয়ম: `/cmd install <url> <filename.js>`", { reply_to_message_id: messageId, parse_mode: "Markdown" });
            if (!fileName.endsWith(".js")) fileName += ".js";

            if (!isURL(url)) return bot.sendMessage(chatId, "⚠️ একটি সঠিক URL প্রদান করুন।", { reply_to_message_id: messageId });

            if (url.includes("github.com") && url.includes("/blob/")) {
                url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
            }

            const statusMsg = await bot.sendMessage(chatId, "⏳ ফাইল ডাউনলোড এবং সেটআপ করা হচ্ছে...", { reply_to_message_id: messageId });

            try {
                const res = await axios.get(url, { timeout: 15000 });
                const rawCode = res.data;

                const filePath = path.join(COMMANDS_DIR, fileName);
                fs.writeFileSync(filePath, rawCode, "utf8");

                delete require.cache[require.resolve(filePath)];

                await bot.deleteMessage(chatId, statusMsg.message_id);
                return bot.sendMessage(
                    chatId,
                    `✅ **"${fileName}"** সফলতা সহ ইনস্টল এবং লোড করা হয়েছে!`,
                    { reply_to_message_id: messageId, parse_mode: "Markdown", reply_markup: { inline_keyboard: defaultButtons } }
                );
            } catch (err) {
                return bot.editMessageText(
                    `❌ ফাইল ডাউনলোড ব্যর্থ হয়েছে: ${err.message}`,
                    { chat_id: chatId, message_id: statusMsg.message_id }
                );
            }
        }
    },

    handleLoadAll: async (bot, chatId, messageId) => {
        try {
            const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js"));
            let loadedCount = 0;
            let failedFiles = [];

            files.forEach(file => {
                const filePath = path.join(COMMANDS_DIR, file);
                try {
                    delete require.cache[require.resolve(filePath)];
                    require(filePath); // চেক করবে ফাইলটিতে কোনো সিনট্যাক্স বা ক্যাচ এরর আছে কিনা
                    loadedCount++;
                } catch (err) {
                    failedFiles.push({ file, error: err.message });
                }
            });

            let responseText = `╭──「 ⚙️ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐒𝐓𝐀𝐓𝐔𝐒 」──╮\n`;
            responseText += `│\n`;
            responseText += `│ 📂 𝐓𝐨𝐭𝐚𝐥 𝐅𝐢𝐥𝐞𝐬   : \`${files.length}\`\n`;
            responseText += `│ ✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥    : \`${loadedCount}\`\n`;
            responseText += `│ ❌ 𝐅𝐚𝐢𝐥𝐞𝐝/𝐄𝐫𝐫𝐨𝐫 : \`${failedFiles.length}\`\n`;
            responseText += `│\n`;
            responseText += `╰────────────────────────╯\n`;

            if (failedFiles.length > 0) {
                responseText += `\n⚠️ **সমস্যাযুক্ত ফাইলসমূহ:**\n`;
                failedFiles.forEach((item, idx) => {
                    responseText += `\n${idx + 1}. \`${item.file}\`\n   ┗ 🔴 Error: \`${item.error}\`\n`;
                });
            } else {
                responseText += `\n✨ সকল কমান্ড ফাইল সফলভাবে লোড হয়েছে!`;
            }

            return bot.sendMessage(
                chatId,
                responseText,
                { reply_to_message_id: messageId, parse_mode: "Markdown" }
            );
        } catch (e) {
            return bot.sendMessage(chatId, `❌ সিস্টেম লোড এরর: ${e.message}`, { reply_to_message_id: messageId });
        }
    },

    handleLoad: async (bot, chatId, messageId, fileName) => {
        const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
        const filePath = path.join(COMMANDS_DIR, fileWithExt);

        if (!fs.existsSync(filePath)) {
            return bot.sendMessage(chatId, `⚠️ **"${fileWithExt}"** ফাইলটি খুজে পাওয়া যায়নি!`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
        }

        try {
            delete require.cache[require.resolve(filePath)];
            require(filePath);
            return bot.sendMessage(chatId, `✅ **"${fileWithExt}"** রিলোড সম্পন্ন হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
        } catch (err) {
            return bot.sendMessage(chatId, `❌ **"${fileWithExt}"** লোড করতে ব্যর্থ!\n🔴 **এরর:** \`${err.message}\``, { reply_to_message_id: messageId, parse_mode: "Markdown" });
        }
    },

    handleUnload: async (bot, chatId, messageId, fileName) => {
        const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
        const filePath = path.join(COMMANDS_DIR, fileWithExt);

        if (!fs.existsSync(filePath)) {
            return bot.sendMessage(chatId, `⚠️ **"${fileWithExt}"** ফাইলটি ডিরেক্টরি-তে নেই!`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
        }

        try {
            delete require.cache[require.resolve(filePath)];
            return bot.sendMessage(chatId, `✅ **"${fileWithExt}"** আনলোড করা হয়েছে।`, { reply_to_message_id: messageId, parse_mode: "Markdown" });
        } catch (err) {
            return bot.sendMessage(chatId, `❌ আনলোড করতে সমস্যা: ${err.message}`, { reply_to_message_id: messageId });
        }
    },

    handleCallback: async (bot, query) => {
        const data = query.data;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;

        const botUsername = config.botUsername || "SiyamSM_2026Bot";
        const ownerUsername = config.ownerUsername || "ri_siyam";

        if (data === "cmd_loadall") {
            await bot.answerCallbackQuery(query.id, { text: "⏳ Command files reloading..." });
            return module.exports.handleLoadAll(bot, chatId, messageId);
        }

        if (data === "cmd_list") {
            await bot.answerCallbackQuery(query.id, { text: "📂 Loading Command Files" });
            const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js"));

            const fileButtons = files.map(file => [
                { text: `⚙️ ${file.replace(".js", "")}`, callback_data: `cmd_manage_${file}` }
            ]);

            fileButtons.push([
                { text: "🔙 Back", callback_data: "cmd_main" }
            ]);

            return bot.editMessageText("📂 **সকল সক্রিয় ফাইল নির্বাচন করুন:**", {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: fileButtons }
            });
        }

        if (data.startsWith("cmd_manage_")) {
            const fileName = data.replace("cmd_manage_", "");
            const manageButtons = [
                [
                    { text: "🔄 Reload Command", callback_data: `cmd_reload_${fileName}` },
                    { text: "❌ Unload Command", callback_data: `cmd_unload_${fileName}` }
                ],
                [
                    { text: "🔙 Back to List", callback_data: "cmd_list" }
                ]
            ];

            return bot.editMessageText(`📁 **Selected File:** \`${fileName}\`\nপ্রয়োজনীয় অপশন বেছে নিন:`, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: manageButtons }
            });
        }

        if (data.startsWith("cmd_reload_")) {
            const fileName = data.replace("cmd_reload_", "");
            await bot.answerCallbackQuery(query.id, { text: `Reloading ${fileName}...` });
            return module.exports.handleLoad(bot, chatId, messageId, fileName);
        }

        if (data.startsWith("cmd_unload_")) {
            const fileName = data.replace("cmd_unload_", "");
            await bot.answerCallbackQuery(query.id, { text: `Unloading ${fileName}...` });
            return module.exports.handleUnload(bot, chatId, messageId, fileName);
        }

        if (data === "cmd_main") {
            const defaultButtons = [
                [
                    { text: "🔄 Load All Commands", callback_data: "cmd_loadall" },
                    { text: "📜 Command List", callback_data: "cmd_list" }
                ],
                [
                    { text: "➕ ADD GROUP", url: `https://t.me/${botUsername}?startgroup=true` },
                    { text: "👑 OWNER", url: `https://t.me/${ownerUsername}` }
                ]
            ];

            return bot.editMessageText("🛠 **Command Manager Dashboard**", {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: defaultButtons }
            });
        }
    }
};
