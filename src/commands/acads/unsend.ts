import { ApplicationCommandOptionType, type Client, type CommandInteraction } from 'discord.js';
import type { CommandOption, UnsendOptions } from '../../utils/schema';
import { extractUserOptions, getMessageHistory, unsendEvents } from '../../utils/commands';

const commandOptions = [
    {
        name: 'steps',
        description: 'Number of send command to unsend. [ default : 1 ]',
        type: ApplicationCommandOptionType.Number,
        required: false,
        default: 1,
    },
    {
        name: 'preview',
        description: 'Preview the unsend command without executing it. [ default : false ]',
        type: ApplicationCommandOptionType.Number,
        required: false,
        choices: [
            { name: 'yes', value: 1 },
            { name: 'no', value: 0 },
        ],
        default: 0,
    },
] as CommandOption[];

// Asynchronously handles the execution of a command interaction
async function commandCallback(client: Client, interaction: CommandInteraction) {
    // Defer replying to let the user know that the bot has received the interaction
    await interaction.deferReply();

    // Extract user options from the interaction
    const userOptions = extractUserOptions<UnsendOptions>(interaction, commandOptions);

    const messageHistory = getMessageHistory(userOptions.steps.value);
    if (messageHistory.length === 0) {
        await interaction.editReply('History is empty');
        return;
    }

    // FIXME: message to the user
    // FIXME: delete data in logs once unsend is done
    unsendEvents(client, messageHistory);

    interaction.editReply('hi');
}

module.exports = {
    deleted: false,
    devOnly: false,
    allowedServerOnly: true,
    name: 'unsend',
    description: 'unsend requirements from threads!',
    options: commandOptions,
    callback: commandCallback,
};
