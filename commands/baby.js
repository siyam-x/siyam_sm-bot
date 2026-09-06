const axios = require("axios");

const AUTHOR = "MahMUD";

const mahmud = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "bot",
    "জান",
    "জানু",
    "বেবি",
    "hi",
    "বট",
    "নিঝুম"
];

const aliases = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "janu",
    "wifey",
    "bot",
    "hinata",
    "hina",
    "জান",
    "জানু",
    "বেবি",
    "hi",
    "বট",
    "নিঝুম"
];

const directReplies = [
    "বলো বাবু, কী বলবা? 🥺🫶",
    "হুম জান, আমি তো আছি তোমার সাথেই 😚🖤",
    "আমাকে ডাকছো কেন বাবু? বলো কী হয়েছে? 🥹"
];

const replyStore = new Map();

const baseApiUrl = async () => {
    const response = await axios.get(
        "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
        {
            timeout: 15000
        }
    );

    return response.data.mahmud;
};

const getBotResponse = async text => {
    try {
        const response = await axios.post(
            `${await baseApiUrl()}/api/hinata`,
            {
                text,
                style: 3,
                attachments: []
            },
            {
                timeout: 30000
            }
        );

        return response.data.message || "error baby🥹";
    } catch (error) {
        console.error(
            "[BABY API]",
            error.response?.data || error.message
        );

        return "error baby🥹";
    }
};

const normalize = text => {
    return String(text || "")
        .trim()
        .toLowerCase();
};

const getText = msg => {
    return msg.text || msg.caption || "";
};

const isBabyCall = text => {
    const message = normalize(text);

    return mahmud.some(word =>
        message === word ||
        message.startsWith(`${word} `)
    );
};

const removePrefix = text => {
    const message = normalize(text);

    for (const prefix of mahmud) {
        if (
            message === prefix ||
            message.startsWith(`${prefix} `)
        ) {
            return message
                .substring(prefix.length)
                .trim();
        }
    }

    return message;
};

const sendAndStore = async (
    bot,
    chatId,
    messageId,
    text
) => {
    const sent = await bot.sendMessage(
        chatId,
        text,
        {
            reply_to_message_id: messageId
        }
    );

    replyStore.set(
        sent.message_id,
        {
            chatId
        }
    );

    return sent;
};

module.exports = {
    name: "baby",
    aliases,
    version: "2.1",
    author: AUTHOR,
    category: "chat",
    description: "Baby AI Chat",
    guide:
        "baby [message]\nteach [question] - [response]\nremove [question] - [index]\nlist\nlist all\nedit [question] - [newResponse]\nmsg [question]",

    execute: async (
        bot,
        msg,
        text
    ) => {
        const chatId =
            msg.chat.id;

        const messageId =
            msg.message_id;

        const userId =
            msg.from?.id;

        const input =
            normalize(
                text ||
                getText(msg)
            );

        try {
            if (!input) {
                const reply =
                    directReplies[
                        Math.floor(
                            Math.random() *
                            directReplies.length
                        )
                    ];

                await sendAndStore(
                    bot,
                    chatId,
                    messageId,
                    reply
                );

                return;
            }

            const args =
                input.split(/\s+/);

            const command =
                args[0];

            if (command === "teach") {
                const teachText =
                    input
                        .replace(
                            /^teach\s*/i,
                            ""
                        )
                        .trim();

                const parts =
                    teachText.split(" - ");

                const trigger =
                    parts.shift()?.trim();

                const responses =
                    parts.join(" - ")
                        .trim();

                if (
                    !trigger ||
                    !responses
                ) {
                    await bot.sendMessage(
                        chatId,
                        "❌ Format:\nteach [question] - [response1, response2]",
                        {
                            reply_to_message_id:
                                messageId
                        }
                    );

                    return;
                }

                const response =
                    await axios.post(
                        `${await baseApiUrl()}/api/jan/teach`,
                        {
                            trigger,
                            responses,
                            userID: userId
                        },
                        {
                            timeout: 20000
                        }
                    );

                await bot.sendMessage(
                    chatId,
                    `✅ Replies added: "${responses}" to "${trigger}"\n\n• Teacher: ${msg.from?.first_name || "Unknown"}\n• Total: ${response.data.count || 0}`,
                    {
                        reply_to_message_id:
                            messageId
                    }
                );

                return;
            }

            if (
                command === "remove" ||
                command === "rm"
            ) {
                const removeText =
                    input
                        .replace(
                            /^(remove|rm)\s*/i,
                            ""
                        )
                        .trim();

                const parts =
                    removeText.split(" - ");

                const trigger =
                    parts[0]?.trim();

                const index =
                    parts[1]?.trim();

                if (
                    !trigger ||
                    !index ||
                    isNaN(index)
                ) {
                    await bot.sendMessage(
                        chatId,
                        "❌ Format:\nremove [question] - [index]",
                        {
                            reply_to_message_id:
                                messageId
                        }
                    );

                    return;
                }

                const response =
                    await axios.delete(
                        `${await baseApiUrl()}/api/jan/remove`,
                        {
                            data: {
                                trigger,
                                index: parseInt(
                                    index,
                                    10
                                )
                            },
                            timeout: 20000
                        }
                    );

                await bot.sendMessage(
                    chatId,
                    String(
                        response.data.message ||
                        "✅ Removed successfully."
                    ),
                    {
                        reply_to_message_id:
                            messageId
                    }
                );

                return;
            }

            if (command === "list") {
                const endpoint =
                    args[1] === "all"
                        ? "/list/all"
                        : "/list";

                const response =
                    await axios.get(
                        `${await baseApiUrl()}/api/jan${endpoint}`,
                        {
                            timeout: 20000
                        }
                    );

                if (
                    args[1] === "all"
                ) {
                    const data =
                        Object.entries(
                            response.data.data ||
                            {}
                        )
                            .sort(
                                (a, b) =>
                                    b[1] - a[1]
                            )
                            .slice(0, 100);

                    let message =
                        "👑 Baby Teachers\n\n";

                    for (
                        let i = 0;
                        i < data.length;
                        i++
                    ) {
                        const [
                            userID,
                            count
                        ] = data[i];

                        message +=
                            `${i + 1}. ${userID}: ${count}\n`;
                    }

                    await bot.sendMessage(
                        chatId,
                        message,
                        {
                            reply_to_message_id:
                                messageId
                        }
                    );

                    return;
                }

                await bot.sendMessage(
                    chatId,
                    String(
                        response.data.message ||
                        "No list found."
                    ),
                    {
                        reply_to_message_id:
                            messageId
                    }
                );

                return;
            }

            if (command === "edit") {
                const editText =
                    input
                        .replace(
                            /^edit\s*/i,
                            ""
                        )
                        .trim();

                const parts =
                    editText.split(" - ");

                const oldTrigger =
                    parts.shift()?.trim();

                const newResponse =
                    parts.join(" - ")
                        .trim();

                if (
                    !oldTrigger ||
                    !newResponse
                ) {
                    await bot.sendMessage(
                        chatId,
                        "❌ Format:\nedit [question] - [newResponse]",
                        {
                            reply_to_message_id:
                                messageId
                        }
                    );

                    return;
                }

                await axios.put(
                    `${await baseApiUrl()}/api/jan/edit`,
                    {
                        oldTrigger,
                        newResponse
                    },
                    {
                        timeout: 20000
                    }
                );

                await bot.sendMessage(
                    chatId,
                    `✅ Edited "${oldTrigger}" to "${newResponse}"`,
                    {
                        reply_to_message_id:
                            messageId
                    }
                );

                return;
            }

            if (command === "msg") {
                const searchTrigger =
                    input
                        .replace(
                            /^msg\s*/i,
                            ""
                        )
                        .trim();

                if (!searchTrigger) {
                    await bot.sendMessage(
                        chatId,
                        "❌ Please provide a message to search.",
                        {
                            reply_to_message_id:
                                messageId
                        }
                    );

                    return;
                }

                const response =
                    await axios.get(
                        `${await baseApiUrl()}/api/jan/msg`,
                        {
                            params: {
                                userMessage:
                                    `msg ${searchTrigger}`
                            },
                            timeout: 20000
                        }
                    );

                await bot.sendMessage(
                    chatId,
                    String(
                        response.data.message ||
                        "No message found."
                    ),
                    {
                        reply_to_message_id:
                            messageId
                    }
                );

                return;
            }

            const userText =
                removePrefix(input);

            if (!userText) {
                const reply =
                    directReplies[
                        Math.floor(
                            Math.random() *
                            directReplies.length
                        )
                    ];

                await sendAndStore(
                    bot,
                    chatId,
                    messageId,
                    reply
                );

                return;
            }

            const response =
                await getBotResponse(
                    userText
                );

            await sendAndStore(
                bot,
                chatId,
                messageId,
                response
            );

        } catch (error) {
            console.error(
                "[BABY ERROR]",
                error.response?.data ||
                error.message
            );

            await bot.sendMessage(
                chatId,
                "❌ Baby এখন একটু সমস্যায় আছে 🥹\nকিছুক্ষণ পর আবার চেষ্টা করো।",
                {
                    reply_to_message_id:
                        messageId
                }
            );
        }
    },

    onMessage: async (
        bot,
        msg
    ) => {
        const chatId =
            msg.chat.id;

        const messageId =
            msg.message_id;

        const message =
            normalize(
                getText(msg)
            );

        if (!message) {
            return;
        }

        if (
            msg.reply_to_message &&
            replyStore.has(
                msg.reply_to_message.message_id
            )
        ) {
            try {
                const data =
                    replyStore.get(
                        msg.reply_to_message.message_id
                    );

                if (
                    data.chatId !==
                    chatId
                ) {
                    return;
                }

                const response =
                    await getBotResponse(
                        message
                    );

                await sendAndStore(
                    bot,
                    chatId,
                    messageId,
                    response
                );

                return;
            } catch (error) {
                console.error(
                    "[BABY REPLY]",
                    error.message
                );

                return;
            }
        }

        if (
            !isBabyCall(message)
        ) {
            return;
        }

        try {
            const parts =
                message.split(/\s+/);

            if (
                parts.length === 1
            ) {
                const reply =
                    directReplies[
                        Math.floor(
                            Math.random() *
                            directReplies.length
                        )
                    ];

                await sendAndStore(
                    bot,
                    chatId,
                    messageId,
                    reply
                );

                return;
            }

            const userText =
                removePrefix(message);

            if (!userText) {
                return;
            }

            const response =
                await getBotResponse(
                    userText
                );

            await sendAndStore(
                bot,
                chatId,
                messageId,
                response
            );

        } catch (error) {
            console.error(
                "[BABY CHAT]",
                error.message
            );
        }
    }
};
