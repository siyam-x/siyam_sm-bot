const { spawn } = require('child_process');

process.on('uncaughtException', (err) => {
    console.error('Crash Prevented - Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Crash Prevented - Unhandled Rejection:', reason);
});

function startBot() {
    console.log("Starting Bot Runner Instance...");

    const botProcess = spawn('node', ['index.js'], {
        stdio: 'inherit',
        shell: true
    });

    botProcess.on('close', (code) => {
        console.log(`Bot stopped with code ${code}. Restarting in 3 seconds...`);
        setTimeout(startBot, 3000);
    });

    botProcess.on('error', (err) => {
        console.error('Bot Runner Error:', err);
        setTimeout(startBot, 3000);
    });
}

startBot();
