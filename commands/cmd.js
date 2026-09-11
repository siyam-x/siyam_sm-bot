const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BOT_USERNAME = "SiyamSM_2026Bot";
const OWNER_USERNAME = "ri_siyam";

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
	version: "2.0",
	author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
	role: 2, // Admin Only
	category: "admin",
	description: {
		vi: "Quản lý các tệp lệnh của bạn",
		en: "Manage your command files"
	},
	guide: {
		vi: "   {pn} load <tên file lệnh>\n   {pn} loadAll\n   {pn} install <url> <tên file lệnh>",
		en: "   {pn} load <command file name>\n   {pn} loadAll\n   {pn} install <url> <command file name>"
	},

	config: {
		name: "cmd",
		version: "2.0",
		author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
		role: 2,
		category: "admin"
	},

	execute: async (bot, msg, argsText) => {
		const chatId = msg.chat.id;
		const messageId = msg.message_id;
		const args = Array.isArray(argsText) ? argsText : (argsText ? argsText.trim().split(/\s+/) : []);

		const defaultButtons = [
			[
				{ text: "🔄 Load All Commands", callback_data: "cmd_loadall" },
				{ text: "📜 Command List", callback_data: "cmd_list" }
			],
			[
				{ text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
				{ text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
			]
		];

		if (!args.length) {
			return bot.sendMessage(
				chatId,
				"🛠 **Command Manager Dashboard**\n\nনিচের বাটন চেপে ফাইল লোড করুন অথবা কমান্ড মেসেজ লিখুন:\n• `/cmd load <filename>`\n• `/cmd unload <filename>`\n• `/cmd loadall`\n• `/cmd install <url> <filename.js>`",
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

			if (!url || !fileName) return bot.sendMessage(chatId, "⚠️ ব্যবহার: /cmd install <url> <filename.js>", { reply_to_message_id: messageId });
			if (!fileName.endsWith(".js")) fileName += ".js";

			if (!isURL(url)) return bot.sendMessage(chatId, "⚠️ একটি সঠিক লিংক দিন।", { reply_to_message_id: messageId });

			if (url.includes("github.com") && url.includes("/blob/")) {
				url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
			}

			const statusMsg = await bot.sendMessage(chatId, "⏳ কোড ডাউনলোড করা হচ্ছে...", { reply_to_message_id: messageId });

			try {
				const res = await axios.get(url, { timeout: 10000 });
				const rawCode = res.data;

				const filePath = path.join(__dirname, fileName);
				fs.writeFileSync(filePath, rawCode, "utf8");

				delete require.cache[require.resolve(filePath)];

				await bot.deleteMessage(chatId, statusMsg.message_id);
				return bot.sendMessage(
					chatId,
					`✅ "${fileName}" ইন্সটল সফল হয়েছে।`,
					{ reply_to_message_id: messageId, reply_markup: { inline_keyboard: defaultButtons } }
				);
			} catch (err) {
				return bot.editMessageText(
					`❌ ইন্সটল হতে ব্যর্থ: ${err.message}`,
					{ chat_id: chatId, message_id: statusMsg.message_id }
				);
			}
		}
	},

	handleLoadAll: async (bot, chatId, messageId) => {
		try {
			const files = fs.readdirSync(__dirname).filter(file => file.endsWith(".js"));
			let loadedCount = 0;

			files.forEach(file => {
				const filePath = path.join(__dirname, file);
				delete require.cache[require.resolve(filePath)];
				loadedCount++;
			});

			return bot.sendMessage(
				chatId,
				`✅ সফলভাবে (${loadedCount}) টি কমান্ড ফাইল লোড করা হয়েছে।`,
				{ reply_to_message_id: messageId }
			);
		} catch (e) {
			return bot.sendMessage(chatId, `❌ লোড করতে সমস্যা: ${e.message}`, { reply_to_message_id: messageId });
		}
	},

	handleLoad: async (bot, chatId, messageId, fileName) => {
		const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
		const filePath = path.join(__dirname, fileWithExt);

		if (!fs.existsSync(filePath)) {
			return bot.sendMessage(chatId, `⚠️ "${fileWithExt}" ফাইলটি পাওয়া যায়নি।`, { reply_to_message_id: messageId });
		}

		try {
			delete require.cache[require.resolve(filePath)];
			return bot.sendMessage(chatId, `✅ "${fileWithExt}" রিলোড সফল হয়েছে।`, { reply_to_message_id: messageId });
		} catch (err) {
			return bot.sendMessage(chatId, `❌ রিলোড করতে সমস্যা: ${err.message}`, { reply_to_message_id: messageId });
		}
	},

	handleUnload: async (bot, chatId, messageId, fileName) => {
		const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
		const filePath = path.join(__dirname, fileWithExt);

		if (!fs.existsSync(filePath)) {
			return bot.sendMessage(chatId, `⚠️ "${fileWithExt}" ফাইলটি পাওয়া যায়নি।`, { reply_to_message_id: messageId });
		}

		try {
			delete require.cache[require.resolve(filePath)];
			return bot.sendMessage(chatId, `✅ "${fileWithExt}" আনলোড সম্পন্ন হয়েছে।`, { reply_to_message_id: messageId });
		} catch (err) {
			return bot.sendMessage(chatId, `❌ আনলোড করতে সমস্যা: ${err.message}`, { reply_to_message_id: messageId });
		}
	},

	handleCallback: async (bot, query) => {
		const data = query.data;
		const chatId = query.message.chat.id;
		const messageId = query.message.message_id;

		if (data === "cmd_loadall") {
			await bot.answerCallbackQuery(query.id, { text: "⏳ Loading all commands..." });
			return module.exports.handleLoadAll(bot, chatId, messageId);
		}

		if (data === "cmd_list") {
			await bot.answerCallbackQuery(query.id, { text: "📂 Command Files Loaded" });
			const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));

			const fileButtons = files.map(file => [
				{ text: `⚙️ ${file.replace(".js", "")}`, callback_data: `cmd_manage_${file}` }
			]);

			fileButtons.push([
				{ text: "🔙 Back", callback_data: "cmd_main" }
			]);

			return bot.editMessageText("📂 **সবগুলা কমান্ড ফাইল নিচে তালিকাভুক্ত করা হলো:**\nযেকোনো বাটনে ক্লিক করে কমান্ডটি নিয়ন্ত্রণ করুন:", {
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

			return bot.editMessageText(`📁 **ফাইল:** \`${fileName}\`\nএকটি অপশন বেছে নিন:`, {
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
					{ text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
					{ text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
				]
			];

			return bot.editMessageText("🛠 **Command Manager Dashboard**", {
				chat_id: chatId,
				message_id: messageId,
				reply_markup: { inline_keyboard: defaultButtons }
			});
		}
	}
};ileName}...` });
			return module.exports.handleUnload(bot, chatId, messageId, fileName);
		}

		if (data === "cmd_main") {
			const defaultButtons = [
				[
					{ text: "🔄 Load All Commands", callback_data: "cmd_loadall" },
					{ text: "📜 Command List", callback_data: "cmd_list" }
				],
				[
					{ text: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏", url: `https://t.me/${BOT_USERNAME}?startgroup=true` },
					{ text: "𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${OWNER_USERNAME}` }
				]
			];

			return bot.editMessageText("🛠 **Command Manager Dashboard**", {
				chat_id: chatId,
				message_id: messageId,
				reply_markup: { inline_keyboard: defaultButtons }
			});
		}
	}
};
