const { ApplicationCommandOptionType } = require('discord.js');
const { filterValidEvents, groupEvents } = require('../../utils/calendar');
const { fetchCalendarEvents } = require('../../database/calendar');
const {
    makeSendWarningScript,
    generateCommandScript,
    generateDateScript,
    generateSendOutputScript,
} = require('../../utils/scripts');
const {
    applySubjectFilter,
    calculateSearchSpan,
    checkMissingRoles,
    checkMissingThreads,
    extractCommandOptions,
    verifyInputSubjects,
    fetchChannelThreads,
    fetchGuildRoles,
    removeInvalidEvents,
    sendEvents,
} = require('../../utils/commands');

// Slash command options
const commandOptions = [
    {
        name: 'span',
        description: 'Number of weeks to show. [ default : 1 week]',
        type: ApplicationCommandOptionType.Number,
        required: false,
        choices: [
            { name: '1 week', value: 1 },
            { name: '2 weeks', value: 2 },
            { name: '3 weeks', value: 3 },
            { name: '4 weeks', value: 4 },
        ],
        default: 1,
    },
    {
        name: 'start',
        description: 'Start date of the search. [ default : monday ]',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
            { name: 'monday', value: 'monday' },
            { name: 'today', value: 'today' },
        ],
        default: 'monday',
    },
    {
        name: 'force',
        description: 'Force send valid events to channels while ignoring invalid subjects [default : false ]',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
        choices: [
            { name: 'yes', value: true },
            { name: 'no', value: false },
        ],
        default: false,
    },
    {
        name: 'subjects',
        description: 'Subject(s) to query, example input: "21 33 132"',
        type: ApplicationCommandOptionType.String,
        required: false,
        default: null,
    },
];

// Function to handle the command execution
async function commandCallback(_, interaction) {
    // Defer replying to let the user know that the bot has received the interaction
    await interaction.deferReply();

    // Extract user options from the interaction
    const options = extractCommandOptions(interaction, commandOptions);

    // Determine the search interval based on the user-provided options
    const date = calculateSearchSpan(options.span, options.start);

    // Check if the user input subjects are valid
    const invalidInput = verifyInputSubjects(options.subjects);
    if (invalidInput.length) {
        await interaction.editReply(`[ERROR] Invalid Input (subjects) : ${invalidInput.join(', ')}`);
        return;
    }

    // Fetch events from Google Calendar
    let calendarEvents;
    try {
        calendarEvents = await fetchCalendarEvents(date.start, date.end);
    } catch {
        await interaction.editReply('[ERROR] Calendar Request Failed');
        return;
    }

    // Separate valid and invalid events
    const { validEvents, invalidEvents } = filterValidEvents(calendarEvents);

    // Apply subject filter to valid events
    const filteredValidEvents = applySubjectFilter(validEvents, options.subjects);
    const validSubjects = [...new Set(filteredValidEvents.map((event) => event.subject))];
    const invalidSubjects = invalidEvents.map((event) => event.summary);

    // Fetch and verify if threads exist
    const threads = fetchChannelThreads('acads', interaction);
    const missingThreads = checkMissingThreads(threads, validSubjects);

    // Fetch and verify if roles exist
    const roles = fetchGuildRoles(interaction);
    const missingRoles = checkMissingRoles(roles, validSubjects);

    // End the program if force is not enabled and there are warnings
    const warningFlag = invalidEvents.length || missingThreads.length || missingRoles.length;
    const commandScript = generateCommandScript('send', options, commandOptions);
    const dateScript = generateDateScript(date);
    if (!options.force && warningFlag) {
        const warningScript = makeSendWarningScript(invalidSubjects, missingThreads, missingRoles);
        await interaction.editReply(commandScript + dateScript + warningScript);
        return;
    }

    // Filter out events that are impossible to send
    const finalEvents = removeInvalidEvents(filteredValidEvents, missingThreads, missingRoles);

    // Find the corresponding channel for each subject, send the message and save the logs.
    const groupedEvents = groupEvents(finalEvents, 'subject');
    const { sentEvents, failedEvents } = await sendEvents(groupedEvents, date, threads, roles);

    // Generate the output script
    const outputScript = generateSendOutputScript(sentEvents, failedEvents);
    const resposeScript = commandScript + dateScript + outputScript;

    // Send the output script
    await interaction.editReply(resposeScript);
}

module.exports = {
    deleted: false,
    devOnly: true,
    allowedServerOnly: true,
    devServerOnly: true,
    name: 'send',
    description: 'send list of requirements to their respective channels',
    options: commandOptions,
    callback: commandCallback,
};
