require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN || '8727175563:AAF3UGfeX3bQxBpvufUeCSepWuaVyMcQ2eg',
    prefix: ',',
    ownerID: 8442705758,
    
    adminIDs: [
        7683797493,
        8442705758, 
        9876543210
    ],

    modIDs: [],

    whitelistMode: {
        enable: false,
        whiteListIds: [
            "8442705758"
        ]
    }
};
