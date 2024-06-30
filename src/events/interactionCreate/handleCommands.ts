/* eslint-disable no-console */
import type { Client, CommandInteraction } from 'discord.js';
import { devServers, devs } from '../../../config.json';
import { toRed, wrap } from '../../utils/discordColor';
import { getLocalCommands } from '../../utils/discord';

module.exports = async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.isCommand()) return;

    const localCommands = getLocalCommands();
    const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

    if (!commandObject) return;

    if (commandObject.devOnly && !devs.includes(interaction.user.id)) {
        await interaction.reply({
            content: 'This command is only available to developers.',
            ephemeral: true,
        });
        return;
    }

    if (interaction.guild && !devServers.includes(interaction.guild.id)) {
        await interaction.reply({
            content: 'This command is only available in the development server.',
            ephemeral: true,
        });
        return;
    }

    // TODO: add role restrictions here
    const commandName = commandObject.name;

    // TODO: better error handling!
    try {
        console.log(`🚀 Running command "${commandName}"`);
        await commandObject.callback(client, interaction);
        console.log(`✅ Command "${commandName}" executed successfully!`);
    } catch (error) {
        if (error instanceof Error) {
            const { name, message, stack } = error;

            let errorMessage: string;
            if (name === 'SendableError') {
                errorMessage = message;
            } else {
                errorMessage = wrap(toRed(`An error occurred while executing the command.\n[ ${name}: ${message} ]`));
            }

            await interaction.editReply(errorMessage);
            console.log(`🆘 Error in running ${commandName}`);
            console.log(stack);
        } else {
            const errorMessage = wrap(toRed('An error occurred while executing the command.'));
            await interaction.editReply(errorMessage);
            console.log(`🆘 Error in running ${commandName}`);
            console.log(error);
        }
    }
};
