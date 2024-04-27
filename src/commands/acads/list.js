const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');

const { formatDate, addDaysToDate, getSunday } = require('../../utils/functions');
const { groupEvents, validateEvents } = require('../../utils/calendar');
const { makeValidListScript, makeInvalidListScript } = require('../../utils/script');
const { getCalendarEvents } = require('../../database/calendar');

module.exports = {
    deleted: false,
    devOnly: true,
    devServerOnly: true,

    name: 'list',
    description: 'List events from google calendar.',
    options: [
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
            description: 'Start date of the search. [ default : sunday ]',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'sunday', value: 'sunday' },
                { name: 'today', value: 'today' },
            ],
            default: 'sunday',
        },
        {
            name: 'group',
            description: 'Set how the events are grouped. [ default : date ]',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'date', value: 'date' },
                { name: 'subject', value: 'subject' },
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
        const date = getSearchDates(opt.span, opt.start);

        // get calendar events
        let calendarEvents;
        try {
            calendarEvents = await getCalendarEvents(date.start, date.end);
        } catch (error) {
            console.log(`🟥 Calendar Request Failed : ${error}`);
            interaction.editReply('[ERROR] Calendar Request Failed');
            return;
        }

        // separate valid and invalid events
        const { validEvents, invalidEvents } = validateEvents(calendarEvents);

        // apply group option
        const groupedEvents = groupEvents(validEvents, opt.group);

        // make script
        const validEventScipt = makeValidListScript(groupedEvents);
        const invalidEventScipt = makeInvalidListScript(invalidEvents);

        // send script
        const script = editScript(opt, date, validEventScipt, invalidEventScipt);
        await interaction.editReply(script);
    },
};

function getOptionValues(options) {
    const optionValues = new Object();
    module.exports.options.forEach((option) => {
        optionValues[option.name] = options.get(option.name)?.value || option.default;
    });
    return optionValues;
}

function getSearchDates(span, align) {
    const start = align == 'sunday' ? getSunday() : new Date();
    start.setHours(0, 0, 0, 0);
    const end = addDaysToDate(start, span * 7 - 1);
    end.setHours(23, 59, 59, 999);
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

    if (invalidEventScipt.length != 0) {
        invalidEventScipt = '[ Unrecognized Events Found! ]\n' + invalidEventScipt;
    }
    warningScript = warningScript.replace('[<invalidEvents>]', invalidEventScipt);

    return warningScript;
}
