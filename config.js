require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN || '8727175563:AAF3UGfeX3bQxBpvufUeCSepWuaVyMcQ2eg',
    prefix: ',',
    ownerID: 7683797493,
    
    adminIDs: [
        7683797493,
        1234567890, 
        9876543210
    ],

    modIDs: [],

    whitelistMode: {
        enable: false,
        whiteListIds: [
            "7683797493"
        ]
    }
};
