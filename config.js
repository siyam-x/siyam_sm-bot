require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN || '8973277623:AAE8rALePkquP5UaQJNShK45U8AQ-Q6VBlc',
    prefix: ',',
    ownerID: 8442705758,
    
    // Role 2: Super Admin / Owner
    adminIDs: [
        8442705758
    ],

    // Role 1: Moderator / Sub-Admin
    modIDs: [],

    whitelistMode: false,
    whitelistedIDs: [
        8442705758
    ]
};
