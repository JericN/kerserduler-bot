// get list of events from google calendar
const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');
const { addDaysToDate, formatDate, getFirstDayOfWeek } = require('../../utils/function/date.js');
const getCalendarEvents = require('../../utils/google/getCalendarEvents.js');





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
            ]
        },
        {
            name: 'align',
            description: 'Align to first day of the week (sunday). [ default : yes ]',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'yes', value: 'yes' },
                { name: 'no', value: 'no' },
            ]
        },
        {
            name: 'group',
            description: 'Group result by subject or sorted. [ default : subject ]',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'subject', value: 'subject' },
                { name: 'sorted', value: 'sorted' },
            ]
        }
    ],


    callback: async (client, interaction) => {
        await interaction.deferReply();

        // variables
        var validEventScipt, invalidEventScipt;

        // get option values
        const optSpan = interaction.options.get('span').value;
        const optAlign = interaction.options.get('align')?.value || 'yes';
        const optGroup = interaction.options.get('group')?.value || 'subject';

        // set search span
        const startDate = (optAlign == 'yes') ? getFirstDayOfWeek() : new Date();
        const endDate = addDaysToDate(startDate, optSpan * 7 - 1);

        // get calendar events
        try {
            var { validEvents, invalidEvents } = await getCalendarEvents(startDate, endDate);
        } catch (error) {
            console.log(`[ERROR] Calendar Request Failed : ${error}`);
            return;
        }

        // parse valid events to script
        const validEventList = objectToList(validEvents);
        if (optGroup == 'sorted') sortEventsByDate(validEventList);
        validEventScipt = makeEventScript(validEventList);

        // parse invalid events to script
        if (invalidEvents.length != 0) {
            invalidEventScipt = makeEventScript(objectToList(invalidEvents));
        }

        // send message
        const warningScript = editScript(optSpan, optAlign, optGroup, startDate, endDate, validEventScipt, invalidEventScipt);
        await interaction.editReply(warningScript);
    }
};









function objectToList(object) {
    array = new Array();
    Object.values(object).forEach((events) => {
        array.push(...events);
    });
    return array;
}


function sortEventsByDate(events) {
    events.sort((a, b) => {
        return new Date(a['start']['date']) - new Date(b['start']['date']);
    });
}


function makeEventScript(events, script = '') {
    const makeScript = (event) => {
        let eventDate = formatDate(new Date(event['start']['date']));
        eventDate = eventDate.concat(' '.repeat(6 - eventDate.length));
        return (`${eventDate} - ${event.summary} \n`);
    };

    events.forEach((event) => {
        script = script.concat(makeScript(event));
    });
    return script;
}


function editScript(optSpan, optAlign, optGroup, startDate, endDate, validEventScipt, invalidEventScipt) {
    const commandScript = `Command: list [span] ${optSpan} week(s), [align] ${optAlign}, [group] ${optGroup}`;
    let warningScript = fs.readFileSync(path.join(__dirname, '../../data/scripts/list_warning.txt'), 'utf-8');
    warningScript = warningScript
        .replace('[<command>]', commandScript)
        .replace('[<startDate>]', formatDate(startDate))
        .replace('[<endDate>]', formatDate(endDate))
        .replace('[<validEvents>]', validEventScipt);

    if (invalidEventScipt.length != 0) invalidEventScipt = '[ Unrecognized Events Found! ]\n' + invalidEventScipt;
    warningScript = warningScript.replace('[<invalidEvents>]', invalidEventScipt);

    return warningScript;
}



// const startDate = new Date(new Date().setDate(new Date().getDate() - 24 * 7 - 1));
// const endDate = new Date(new Date().setDate(new Date().getDate() - 20 * 7 - 1));