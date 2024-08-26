import fs from 'fs';
import path from 'path';

import { Client, CommandInteraction } from 'discord.js';
import { fetchActiveRoles, fetchActiveThreads, findMissingRoles, findMissingThreads } from '../../utils/commands';
import { generateCommandScript, generateSendWarningScript } from '../../utils/scripts';
import { thread_channel } from '../../../config.json';

function wrap(text: string) {
    return '```asciidoc\n' + text + '\n```';
}

const subjectList = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/)
    .filter((subject) => subject.length > 0);

// Asynchronously handles the execution of a command interaction
async function commandCallback(_: Client, interaction: CommandInteraction) {
    // Defer replying to let the user know that the bot has received the interaction
    await interaction.deferReply();

    // Fetch and verify the existence of threads
    const activeThreads = await fetchActiveThreads(thread_channel, interaction);
    const missingThreads = findMissingThreads(activeThreads, subjectList);

    // Fetch and verify the existence of roles
    const activeRoles = fetchActiveRoles(interaction);
    const missingRoles = findMissingRoles(activeRoles, subjectList);

    // Generate the command script and date script
    const commandScript = generateCommandScript('validate', {});
    const warningScript = generateSendWarningScript([], missingThreads, missingRoles);

    // Display valid subjects if no warnings
    if (!warningScript.length) {
        const script = `[ Subjects Ready ]\n${subjectList.join('\n')}`;
        await interaction.editReply(commandScript + wrap(script));
        return;
    }

    // Display warning script if there are warnings
    await interaction.editReply(warningScript);
}

module.exports = {
    deleted: false,
    devOnly: false,
    allowedServerOnly: true,
    name: 'validate',
    description: 'validate the server if it has all the necessary channels and roles for sending acads requirements!',
    options: [],
    callback: commandCallback,
};
