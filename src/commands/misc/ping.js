module.exports = {
    deleted: false,
    name: 'ping',
    description: 'A ping command',
    devOnly: false,
    devServerOnly: false,
    callback: (client, interaction) => {
        interaction.reply('Pong!');
    },
};
