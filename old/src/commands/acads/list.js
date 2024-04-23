// get list of events from google calendar
const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');
const { getCalendarEvents, separateEvents } = require('../../utils/googleFunctions.js');
const {
    addDaysToDate,
    formatDate,
    getFirstDayOfWeek,
    objectToList,
    sortEventsByDate,
    makeEventListScript,
} = require('../../utils/generalFunctions.js');

module.exports = {
    deleted: false,
    name: 'list',
    description: 'get list of events',
    options: [
        {
            name: 'span',
            description: 'Search span',
            type: ApplicationCommandOptionType.Number,
            required: true,
            choices: [
                { name: '1 week', value: 1 },
                { name: '2 weeks', value: 2 },
                { name: '3 weeks', value: 3 },
                { name: '4 weeks', value: 4 },
            ],
        },
        {
            name: 'align',
            description: 'Start with with first day of the week (sunday). [ default : yes ]',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'yes', value: 'yes' },
                { name: 'no', value: 'no' },
            ],
            default: 'yes',
        },
        {
            name: 'group',
            description: 'Group result by subject or sorted. [ default : subject ]',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'subject', value: 'subject' },
                { name: 'sorted', value: 'sorted' },
            ],
            default: 'subject',
        },
    ],
    allowedServerOnly: true,

    callback: async (client, interaction) => {
        await interaction.deferReply();

        // get command options
        const opt = getOptionValues(interaction.options);

        // set search span
        const dates = getSearchDates(opt.span, opt.align);

        // get calendar events
        let calendarEvents;
        try {
            calendarEvents = await getCalendarEvents(dates.start, dates.end);
        } catch (error) {
            console.log(`[ERROR] Calendar Request Failed : ${error}`);
            interaction.editReply(`[ERROR] Calendar Request Failed : ${error}`);
            return;
        }

        // separate valid and invalid events
        const { validEvents, invalidEvents } = separateEvents(calendarEvents);
        const validEventList = objectToList(validEvents);

        // apply options
        if (opt.group == 'sorted') sortEventsByDate(validEventList);

        // make script
        const validEventScipt = makeEventListScript(validEventList);
        const invalidEventScipt = makeEventListScript(invalidEvents);

        // send script
        const script = editScript(opt, dates, validEventScipt, invalidEventScipt);
        await interaction.editReply(script);
    },
};

function getOptionValues(options) {
    const optionValues = new Object();
    module.exports.options.forEach(option => {
        optionValues[option.name] = options.get(option.name)?.value || option.default;
    });
    return optionValues;
}

function getSearchDates(span, align) {
    const start = align == 'yes' ? getFirstDayOfWeek() : new Date();
    const end = addDaysToDate(start, span * 7 - 1);
    return { start, end };
}

function editScript(opt, dates, validEventScipt, invalidEventScipt) {
    const commandScript = `Command: list [span] ${opt.span} week(s), [align] ${opt.align}, [group] ${opt.group}`;

    let warningScript = fs.readFileSync(path.join(__dirname, '../../data/scripts/list_warning.txt'), 'utf-8');
    warningScript = warningScript
        .replace('[<command>]', commandScript)
        .replace('[<startDate>]', formatDate(dates.start))
        .replace('[<endDate>]', formatDate(dates.end))
        .replace('[<validEvents>]', validEventScipt);

    if (invalidEventScipt.length != 0) invalidEventScipt = '[ Unrecognized Events Found! ]\n' + invalidEventScipt;
    warningScript = warningScript.replace('[<invalidEvents>]', invalidEventScipt);

    return warningScript;
}
