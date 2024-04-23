module.exports = {
    deleted: false,
    name: 'test',
    description: 'A test command',
    devOnly: true,
    devServerOnly: true,
    callback: (client, interaction) => {
        interaction.reply('Test command');
    },
};
