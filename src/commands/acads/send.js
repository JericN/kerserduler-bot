const { ApplicationCommandOptionType } = require('discord.js');
const { fetchGoogleCalendarEvents } = require('../../database/calendar');
const { filterValidEvents, groupEvents } = require('../../utils/calendar');
const {
    generateCommandScript,
    generateDateScript,
    generateSendOutputScript,
    generateSendWarningScript,
} = require('../../utils/scripts');
const {
    applySubjectFilter,
    calculateSearchInterval,
    extractUserOptions,
    fetchActiveThreads,
    fetchActiveRoles,
    filterSendableEvents,
    findMissingRoles,
    findMissingThreads,
    sendEventsToChannels,
    validateInputSubjects,
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

// Asynchronously handles the execution of a command interaction
async function handleCommandExecution(_, interaction) {
    // Defer replying to let the user know that the bot has received the interaction
    await interaction.deferReply();

    // Extract user options from the interaction
    const userOptions = extractUserOptions(interaction, commandOptions);

    // Determine the search interval based on the user-provided options
    const searchInterval = calculateSearchInterval(userOptions.span, userOptions.start);

    // Validate the user input subjects
    const invalidSubjects = validateInputSubjects(userOptions.subjects);
    if (invalidSubjects.length) {
        await interaction.editReply(`[ERROR] Invalid Input (subjects) : ${invalidSubjects.join(', ')}`);
        return;
    }

    // Fetch events from Google Calendar
    let fetchedEvents;
    try {
        fetchedEvents = await fetchGoogleCalendarEvents(searchInterval.start, searchInterval.end);
    } catch {
        await interaction.editReply('[ERROR] Calendar Request Failed');
        return;
    }

    // Separate valid and invalid events
    const { validEvents, invalidEvents } = filterValidEvents(fetchedEvents);

    // Apply subject filter to valid events
    const filteredValidEvents = applySubjectFilter(validEvents, userOptions.subjects);
    const validEventSubjects = [...new Set(filteredValidEvents.map((event) => event.subject))];
    const invalidEventSummaries = invalidEvents.map((event) => event.summary);

    // Fetch and verify the existence of threads
    const activeThreads = fetchActiveThreads('acads', interaction);
    const missingThreads = findMissingThreads(activeThreads, validEventSubjects);

    // Fetch and verify the existence of roles
    const activeRoles = fetchActiveRoles(interaction);
    const missingRoles = findMissingRoles(activeRoles, validEventSubjects);

    // Generate the command script and date script
    const commandScript = generateCommandScript('send', userOptions, commandOptions);
    const dateScript = generateDateScript(searchInterval);

    // End the program if force is not enabled and there are warnings
    const warningFlag = invalidEvents.length || missingThreads.length || missingRoles.length;
    if (!userOptions.force && warningFlag) {
        const warningScript = generateSendWarningScript(invalidEventSummaries, missingThreads, missingRoles);
        await interaction.editReply(commandScript + dateScript + warningScript);
        return;
    }

    // Filter out events that are impossible to send
    const sendableEvents = filterSendableEvents(filteredValidEvents, missingThreads, missingRoles);

    // Group the sendable events by subject
    const groupedEvents = groupEvents(sendableEvents, 'subject');

    // Send the grouped events
    const { successfulEvents, failedEvents } = await sendEventsToChannels(
        groupedEvents,
        searchInterval,
        activeThreads,
        activeRoles,
    );

    // Generate the output script
    const outputScript = generateSendOutputScript(successfulEvents, failedEvents);
    const responseScript = commandScript + dateScript + outputScript;

    // Send the output script
    await interaction.editReply(responseScript);
}

module.exports = {
    deleted: false,
    devOnly: true,
    allowedServerOnly: true,
    devServerOnly: true,
    name: 'send',
    description: 'send list of requirements to their respective channels',
    options: commandOptions,
    callback: handleCommandExecution,
};
