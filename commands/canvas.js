// ১. ফাইলের একদম উপরে প্যাকেজটি ইমপোর্ট/কল করতে হয়
const { createCanvas } = require('canvas');

module.exports = {
    name: 'canvas',
    description: 'Canvas দিয়ে ছবি তৈরি করার পরীক্ষা',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // ২. ২০০x২০০ সাইজের একটি ক্যানভাস (ডিজিটাল আর্টবোর্ড) তৈরি
        const canvas = createCanvas(200, 200);
        const ctx = canvas.getContext('2d');

        // ব্যাকগ্রাউন্ড কালার দেওয়া (লাল)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 200, 200);

        // টেক্সট লেখা (সাদা রঙে)
        ctx.font = '30px Sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Hello!', 50, 100);

        // ৩. তৈরি করা ছবিটিকে Buffer এ রূপান্তর করা
        const imageBuffer = canvas.toBuffer();

        // ৪. টেলিগ্রামে ছবি পাঠানো
        await bot.sendPhoto(chatId, imageBuffer, {
            caption: '🎨 Canvas দিয়ে তৈরি করা ছবি!'
        });
    }
};
