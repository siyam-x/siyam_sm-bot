const axios = require("axios");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const COMMAND_NAME = "downloader";

// ======================================================
// CONFIG
// ======================================================

const API_TIMEOUT = 15000;

// ======================================================
// HELPER: URL CHECK
// ======================================================

function extractUrl(text) {
    if (!text) return null;

    const match = text.match(
        /https?:\/\/[^\s<>"']+/i
    );

    return match ? match[0].replace(/[),.!?]+$/, "") : null;
}

// ======================================================
// HELPER: FIND VIDEO URL FROM ANY RESPONSE
// ======================================================

function findVideoUrl(data) {
    if (!data) return null;

    const possibleKeys = [
        "video",
        "videoUrl",
        "video_url",
        "download",
        "downloadUrl",
        "download_url",
        "url",
        "link",
        "play",
        "playUrl",
        "play_url",
        "high",
        "hd",
        "hdplay",
        "nowm",
        "noWatermark",
        "no_watermark",
        "media"
    ];

    function search(obj, depth = 0) {
        if (!obj || depth > 7) return null;

        if (typeof obj === "string") {
            if (
                /^https?:\/\//i.test(obj) &&
                /\.(mp4|m3u8|mov|webm)(\?|$)/i.test(obj)
            ) {
                return obj;
            }

            // অনেক API extension ছাড়াই direct video URL দেয়
            if (
                /^https?:\/\//i.test(obj) &&
                (
                    obj.includes(".mp4") ||
                    obj.includes("video") ||
                    obj.includes("download")
                )
            ) {
                return obj;
            }

            return null;
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                const result = search(item, depth + 1);
                if (result) return result;
            }
            return null;
        }

        if (typeof obj === "object") {

            // আগে গুরুত্বপূর্ণ key খুঁজবে
            for (const key of possibleKeys) {
                if (obj[key]) {
                    const result = search(obj[key], depth + 1);
                    if (result) return result;
                }
            }

            // তারপর পুরো object scan করবে
            for (const key of Object.keys(obj)) {
                const result = search(obj[key], depth + 1);
                if (result) return result;
            }
        }

        return null;
    }

    return search(data);
}

// ======================================================
// HELPER: FIND TITLE
// ======================================================

function findTitle(data) {
    if (!data || typeof data !== "object") {
        return "Downloaded Video";
    }

    const keys = [
        "title",
        "caption",
        "description",
        "name"
    ];

    for (const key of keys) {
        if (
            typeof data[key] === "string" &&
            data[key].trim()
        ) {
            return data[key].trim().slice(0, 900);
        }
    }

    if (data.data && typeof data.data === "object") {
        return findTitle(data.data);
    }

    if (data.result && typeof data.result === "object") {
        return findTitle(data.result);
    }

    return "Downloaded Video";
}

// ======================================================
// API REQUEST
// ======================================================

async function callApi(apiUrl) {
    const response = await axios.get(apiUrl, {
        timeout: API_TIMEOUT,
        maxRedirects: 5,
        validateStatus: status =>
            status >= 200 && status < 400,
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
            "Accept": "application/json,text/plain,*/*"
        }
    });

    return response.data;
}

// ======================================================
// API LIST
// ======================================================

async function tryDownload(url) {

    const encoded = encodeURIComponent(url);

    const apis = [

        // 1. TiklyDown
        {
            name: "TiklyDown",
            url:
                `https://api.tiklydown.eu.org/api/download?url=${encoded}`
        },

        // 2. Ruhend
        {
            name: "Ruhend",
            url:
                `https://ruhend-api.onrender.com/api/alldown?url=${encoded}`
        },

        // 3. SnapTik
        {
            name: "SnapTik",
            url:
                `https://api.snaptik.app/download?url=${encoded}`
        },

        // 4. TikWM
        {
            name: "TikWM",
            url:
                `https://www.tikwm.com/api/?url=${encoded}`
        },

        // 5. TikTok downloader
        {
            name: "TikMate",
            url:
                `https://api.tikmate.app/api/download?url=${encoded}`
        },

        // 6. SaveTik
        {
            name: "SaveTik",
            url:
                `https://savetik.co/api/download?url=${encoded}`
        }
    ];

    let lastError = null;

    for (const api of apis) {

        try {

            console.log(
                `[DOWNLOADER] Trying ${api.name}...`
            );

            const data = await callApi(api.url);

            const videoUrl = findVideoUrl(data);

            if (videoUrl) {

                console.log(
                    `[DOWNLOADER] SUCCESS: ${api.name}`
                );

                return {
                    videoUrl,
                    title: findTitle(data),
                    api: api.name
                };
            }

            console.log(
                `[DOWNLOADER] ${api.name}: No video URL`
            );

        } catch (error) {

            lastError = error;

            console.log(
                `[DOWNLOADER] ${api.name} FAILED:`,
                error.message
            );

            // পরের API-তে যাবে
            continue;
        }
    }

    throw new Error(
        lastError
            ? lastError.message
            : "All downloader APIs failed."
    );
}

// ======================================================
// MODULE
// ======================================================

module.exports = {

    name: COMMAND_NAME,

    version: "3.0.0",

    author: AUTHOR,

    category: "media",

    description:
        "Multi API video downloader for Facebook, TikTok, Instagram & YouTube",

    execute: async (bot, msg, text) => {

        // ==================================================
        // SECURITY CHECK
        // ==================================================

        if (
            module.exports.author !== AUTHOR ||
            module.exports.name !== COMMAND_NAME
        ) {
            return;
        }

        // ==================================================
        // BASIC DATA
        // ==================================================

        const chatId = msg.chat.id;

        const messageId = msg.message_id;

        const messageText =
            text ||
            msg.text ||
            msg.caption ||
            "";

        // ==================================================
        // EXTRACT URL
        // ==================================================

        const url = extractUrl(messageText);

        if (!url) {
            return;
        }

        // ==================================================
        // LOADING MESSAGE
        // ==================================================

        let loadingMsg;

        try {

            loadingMsg = await bot.sendMessage(
                chatId,
                "⏳ *ভিডিওটি প্রসেস করা হচ্ছে...*\n\n" +
                "🔄 একাধিক ডাউনলোড সার্ভার পরীক্ষা করা হচ্ছে।",
                {
                    parse_mode: "Markdown",
                    reply_to_message_id: messageId
                }
            );

        } catch (e) {

            console.log(
                "Loading message error:",
                e.message
            );
        }

        // ==================================================
        // DOWNLOAD
        // ==================================================

        try {

            const result =
                await tryDownload(url);

            const videoUrl =
                result.videoUrl;

            const title =
                result.title ||
                "Downloaded Video";

            const apiName =
                result.api;

            console.log(
                `[DOWNLOADER] Downloaded using ${apiName}`
            );

            // ==================================================
            // DELETE LOADING MESSAGE
            // ==================================================

            if (loadingMsg) {

                try {

                    await bot.deleteMessage(
                        chatId,
                        loadingMsg.message_id
                    );

                } catch (e) {

                    console.log(
                        "Delete loading error:",
                        e.message
                    );
                }
            }

            // ==================================================
            // CAPTION
            // ==================================================

            const safeTitle =
                String(title)
                    .replace(/[*_`[\]]/g, "")
                    .slice(0, 700);

            const caption =
`📥 *𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃*
━━━━━━━━━━━━━━━━━━
🎬 *𝐓𝐈𝐓𝐋𝐄:* ${safeTitle}
━━━━━━━━━━━━━━━━━━
⚡ *𝐒𝐄𝐑𝐕𝐄𝐑:* ${apiName}
━━━━━━━━━━━━━━━━━━
🦋 *‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧*`;

            // ==================================================
            // SEND VIDEO
            // ==================================================

            await bot.sendVideo(
                chatId,
                videoUrl,
                {
                    caption,
                    parse_mode: "Markdown",
                    reply_to_message_id: messageId,

                    // Telegram-এর video processing-এর জন্য
                    supports_streaming: true
                }
            );

        } catch (err) {

            console.error(
                "[DOWNLOADER ERROR]",
                err
            );

            // ==================================================
            // ERROR MESSAGE
            // ==================================================

            const errorText =
`❌ *ভিডিও ডাউনলোড করা সম্ভব হয়নি!*

━━━━━━━━━━━━━━━━━━
🔗 লিংকটি সঠিক কিনা চেক করুন।
🌐 ভিডিওটি Public কিনা নিশ্চিত করুন।
🔄 কিছুক্ষণ পর আবার চেষ্টা করুন।

⚠️ বর্তমানে সব ডাউনলোড সার্ভার থেকে
ভিডিও পাওয়া যায়নি।`;

            if (loadingMsg) {

                try {

                    await bot.editMessageText(
                        errorText,
                        {
                            chat_id: chatId,
                            message_id:
                                loadingMsg.message_id,
                            parse_mode: "Markdown"
                        }
                    );

                    return;

                } catch (e) {

                    console.log(
                        "Edit error:",
                        e.message
                    );
                }
            }

            // Loading message না থাকলে
            try {

                await bot.sendMessage(
                    chatId,
                    errorText,
                    {
                        parse_mode: "Markdown",
                        reply_to_message_id: messageId
                    }
                );

            } catch (e) {

                console.error(
                    "Final error message failed:",
                    e.message
                );
            }
        }
    }
};
