const fs = require('fs');
const path = require('path');

const { fetchActiveThreads, fetchActiveRoles, findMissingRoles, findMissingThreads } = require('../../utils/commands');
const { generateSendWarningScript } = require('../../utils/scripts');
const { generateCommandScript } = require('../../utils/scripts');

function wrap(text) {
    return '```asciidoc\n' + text + '\n```';
}

const subjectList = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/)
    .filter((subject) => subject.length > 0);

// Asynchronously handles the execution of a command interaction
async function commandCallback(_, interaction) {
    // Defer replying to let the user know that the bot has received the interaction
    await interaction.deferReply();

    // Fetch and verify the existence of threads
    const activeThreads = fetchActiveThreads('acads', interaction);
    const missingThreads = findMissingThreads(activeThreads, subjectList);

    // Fetch and verify the existence of roles
    const activeRoles = fetchActiveRoles(interaction);
    const missingRoles = findMissingRoles(activeRoles, subjectList);

    // Generate the command script and date script
    const commandScript = generateCommandScript('validate', [], []);
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
    devOnly: true,
    allowedServerOnly: true,
    devServerOnly: true,
    name: 'validate',
    description: 'validate the server if it has all the necessary channels and roles for sending acads requirements',
    options: [],
    callback: commandCallback,
};
