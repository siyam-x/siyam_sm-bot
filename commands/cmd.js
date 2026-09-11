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

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

module.exports = {
	config: {
		name: "cmd",
		version: "2.0",
		author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
		countDown: 5,
		role: 2, // Admin Only
		category: "admin",
		description: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		guide: {
			vi: "   {pn} load <tên file lệnh>\n   {pn} loadAll\n   {pn} install <url> <tên file lệnh>",
			en: "   {pn} load <command file name>\n   {pn} loadAll\n   {pn} install <url> <command file name>"
		}
	},

	langs: {
		vi: {
			missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
			loaded: "✅ | Đã load command \"%1\" thành công",
			loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2",
			loadedSuccess: "✅ | Đã load thành công (%1) command",
			loadedFail: "❌ | Load thất bại (%1) command\n%2",
			missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload",
			unloaded: "✅ | Đã unload command \"%1\" thành công",
			missingUrlCodeOrFileName: "⚠️ | Vui lòng nhập vào url hoặc code và tên file lệnh bạn muốn cài đặt",
			missingFileNameInstall: "⚠️ | Vui lòng nhập vào tên file để lưu lệnh (đuôi .js)",
			invalidUrl: "⚠️ | Vui lòng nhập vào url hợp lệ",
			installed: "✅ | Đã cài đặt command \"%1\" thành công",
			installedError: "❌ | Cài đặt command \"%1\" thất bại với lỗi\n%2",
			missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\""
		},
		en: {
			missingFileName: "⚠️ | Please enter the command name you want to reload",
			loaded: "✅ | Loaded command \"%1\" successfully",
			loadedError: "❌ | Failed to load command \"%1\" with error\n%2",
			loadedSuccess: "✅ | Loaded successfully (%1) command",
			loadedFail: "❌ | Failed to load (%1) command\n%2",
			missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload",
			unloaded: "✅ | Unloaded command \"%1\" successfully",
			missingUrlCodeOrFileName: "⚠️ | Please enter the url or code and command file name you want to install",
			missingFileNameInstall: "⚠️ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠️ | Please enter a valid url",
			installed: "✅ | Installed command \"%1\" successfully",
			installedError: "❌ | Failed to install command \"%1\" with error\n%2",
			missingFile: "⚠️ | Command file \"%1\" not found"
		}
	},

	execute: async (bot, msg, argsText) => {
		const chatId = msg.chat.id;
		const messageId = msg.message_id;
		const args = Array.isArray(argsText) ? argsText : (argsText ? argsText.trim().split(/\s+/) : []);
		const lang = "en"; // Default Language

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
				"🛠 **Command Manager Dashboard**\n\nনিচের বাটন চেপে ডায়নামিকালি ফাইল লোড করুন অথবা কমান্ড মেসেজ লিখুন:\n• `/cmd load <filename>`\n• `/cmd unload <filename>`\n• `/cmd loadall`\n• `/cmd install <url> <filename.js>`",
				{
					reply_to_message_id: messageId,
					parse_mode: "Markdown",
					reply_markup: { inline_keyboard: defaultButtons }
				}
			);
		}

		const action = args[0].toLowerCase();

		// --- Load All ---
		if (action === "loadall") {
			return module.exports.handleLoadAll(bot, chatId, messageId);
		}

		// --- Load Single ---
		if (action === "load") {
			const fileName = args[1];
			if (!fileName) return bot.sendMessage(chatId, module.exports.langs[lang].missingFileName, { reply_to_message_id: messageId });
			return module.exports.handleLoad(bot, chatId, messageId, fileName);
		}

		// --- Unload ---
		if (action === "unload") {
			const fileName = args[1];
			if (!fileName) return bot.sendMessage(chatId, module.exports.langs[lang].missingCommandNameUnload, { reply_to_message_id: messageId });
			return module.exports.handleUnload(bot, chatId, messageId, fileName);
		}

		// --- Install ---
		if (action === "install") {
			let url = args[1];
			let fileName = args[2];

			if (!url || !fileName) return bot.sendMessage(chatId, module.exports.langs[lang].missingUrlCodeOrFileName, { reply_to_message_id: messageId });
			if (!fileName.endsWith(".js")) fileName += ".js";

			if (domain === "github.com") {
				const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
				if (url.match(regex)) url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
			}

			const statusMsg = await bot.sendMessage(chatId, "⏳ Downloading code...", { reply_to_message_id: messageId });

			try {
				const res = await axios.get(url, { timeout: 10000 });
				const rawCode = res.data;

				const filePath = path.join(__dirname, fileName);
				fs.writeFileSync(filePath, rawCode, "utf8");

				delete require.cache[require.resolve(filePath)];

				await bot.deleteMessage(chatId, statusMsg.message_id);
				return bot.sendMessage(
					chatId,
					module.exports.langs[lang].installed.replace("%1", fileName),
					{ reply_to_message_id: messageId, reply_markup: { inline_keyboard: defaultButtons } }
				);
			} catch (err) {
				return bot.editMessageText(
					module.exports.langs[lang].installedError.replace("%1", fileName).replace("%2", err.message),
					{ chat_id: chatId, message_id: statusMsg.message_id }
				);
			}
		}
	},

	// --- Helper Functions for Actions ---
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
				module.exports.langs.en.loadedSuccess.replace("%1", loadedCount),
				{ reply_to_message_id: messageId }
			);
		} catch (e) {
			return bot.sendMessage(chatId, `❌ Failed to load all: ${e.message}`, { reply_to_message_id: messageId });
		}
	},

	handleLoad: async (bot, chatId, messageId, fileName) => {
		const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
		const filePath = path.join(__dirname, fileWithExt);

		if (!fs.existsSync(filePath)) {
			return bot.sendMessage(chatId, module.exports.langs.en.missingFile.replace("%1", fileWithExt), { reply_to_message_id: messageId });
		}

		try {
			delete require.cache[require.resolve(filePath)];
			return bot.sendMessage(chatId, module.exports.langs.en.loaded.replace("%1", fileWithExt), { reply_to_message_id: messageId });
		} catch (err) {
			return bot.sendMessage(chatId, module.exports.langs.en.loadedError.replace("%1", fileWithExt).replace("%2", err.message), { reply_to_message_id: messageId });
		}
	},

	handleUnload: async (bot, chatId, messageId, fileName) => {
		const fileWithExt = fileName.endsWith(".js") ? fileName : `${fileName}.js`;
		const filePath = path.join(__dirname, fileWithExt);

		if (!fs.existsSync(filePath)) {
			return bot.sendMessage(chatId, module.exports.langs.en.missingFile.replace("%1", fileWithExt), { reply_to_message_id: messageId });
		}

		try {
			delete require.cache[require.resolve(filePath)];
			return bot.sendMessage(chatId, module.exports.langs.en.unloaded.replace("%1", fileWithExt), { reply_to_message_id: messageId });
		} catch (err) {
			return bot.sendMessage(chatId, `❌ Unload error: ${err.message}`, { reply_to_message_id: messageId });
		}
	},

	// --- Callback Handler for Interactive Buttons ---
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

			return bot.editMessageText("📂 **সবগুলা কমান্ড ফাইল নিচে তালিকাভুক্ত করা হলো:**\nযেকোনো বাটনে ক্লিক করে কমান্ডটি রিলোড বা নিয়ন্ত্রণ করুন:", {
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

			return bot.editMessageText(`📁 **ফাইল:** \`${fileName}\`\nআপনার পছন্দের অ্যাকশন নির্বাচন করুন:`, {
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
};
