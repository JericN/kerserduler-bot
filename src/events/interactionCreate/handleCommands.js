const { devs, devServers } = require('../../../config.json');
const getLocalCommands = require('../../utils/discord/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();
    const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

    try {
        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                interaction.reply({
                    content: 'This command is only available to developers.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.devServerOnly) {
            if (!devServers.includes(interaction.guild.id)) {
                interaction.reply({
                    content: 'This command is only available in the development server.',
                    ephemeral: true,
                });
                return;
            }
        }

        // TODO: add role restrictions here

        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(`⚠ Error in running ${commandObject.name}: ${error}`);
    }
};
