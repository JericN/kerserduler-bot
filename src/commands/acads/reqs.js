
const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');
const getCalendarEvents = require('../../utils/google/getCalendarEvents.js');
const {
    addDaysToDate,
    formatDate,
    getFirstDayOfWeek,
    objectToList,
    makeEventListScript
} = require('../../utils/function/functions.js');


const listOfSubjects = fs.readFileSync(path.join(__dirname, '../../data/subjects.txt'), 'utf-8').split(/\r?\n/);
const messageScript = fs.readFileSync(path.join(__dirname, '../../data/scripts/event_message.txt'), 'utf-8');


module.exports = {
    deleted: false,
    name: "reqs",
    description: "send list of requirements to their respective channels",
    options: [
        {
            name: 'span',
            description: 'Query search span',
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
            description: 'Align to first day of the week (sunday)',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'yes', value: 'yes' },
                { name: 'no', value: 'no' },
            ]
        },
        {
            name: 'supress',
            description: 'Force send valid events to channels while ignoring invalid subjects',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'yes', value: 'yes' },
                { name: 'no', value: 'no' },
            ]
        },
        {
            name: 'subjects',
            description: 'Subject(s) to query ex."21 33 132"',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],


    callback: async (client, interaction) => {
        await interaction.deferReply();

        let WARNINGFLAG = false;
        const script = new Object({
            'errorWarning': '',
            'eventWarning': '',
            'channelWarning': '',
            'roleWarning': '',
            'nonoScript': '',
            'okkeScript': ''
        });


        // get query values from command, all values are stored in data.
        const data = getOptionsValues(interaction);

        // if specific subjects are given, check if they are valid
        const invalidSubjects = getInvalidSubjectInput(data.subjects);
        if (invalidSubjects.length != 0) {
            script.errorWarning = `[ERROR] Invalid Subject(s) : ${invalidSubjects.join(', ')}`;
            await interaction.editReply(makeErrorScript(data, script));
            return;
        }

        // Get list of desired events from google calendar
        try {
            var { validEvents, invalidEvents } = await getCalendarEvents(data.startDate, data.endDate);
        } catch (error) {
            script.errorWarning = `[ERROR] Calendar Request Failed`;
            await interaction.editReply(makeErrorScript(data, script));
            return;
        }

        // filter and check for invalid events
        filterSubjects(validEvents, data.subjects);
        if (!data.subjects.length && Object.keys(invalidEvents).length != 0) {
            script.eventWarning = makeEventListScript(objectToList(invalidEvents));
            WARNINGFLAG = true;
        }

        // get corresponding subject channels and check for missing channels
        let { guildChannels, missingChannels } = getSubjectChannels(validEvents, interaction);
        if (missingChannels.length != 0) {
            missingChannels.forEach((subject) => {
                script.channelWarning += `${subject.replace('cs', 'CS ')}\n`;
            });
            WARNINGFLAG = true;
        }

        // get guild roles and check for missing roles
        let { guildRoles, missingRoles } = getSubjectRoles(validEvents, interaction);
        if (missingRoles.length != 0) {
            missingRoles.forEach((subject) => {
                script.roleWarning += `${subject.replace('cs', 'CS ')}\n`;
            });
            WARNINGFLAG = true;
        }

        // End program if warning flag is raised, continue if supressed
        if (!data.supress && WARNINGFLAG) {
            await interaction.editReply(makeErrorScript(data, script));
            return;
        }

        // Find the corresponding channel for each subject and send the message, then save the logs.
        const { sentEvents, failedEvents } = await sendEvents(data, validEvents, guildChannels, guildRoles);
        sentEvents.forEach((event) => { script.okkeScript += `${event['subject'].replace('cs', '[SENT] CS ')}\n`; });
        failedEvents.forEach((event) => { script.nonoScript += `${event['subject'].replace('cs', '[FAILED] CS ')}\n`; });

        // make and send result script
        await interaction.editReply(makeErrorScript(data, script));

        // save sent messages to history
        await saveLogs(interaction, sentEvents);
    }
};










function getOptionsValues(interaction) {
    const data = new Object();
    const opt = interaction.options;

    data.span = opt.get('span').value;
    data.align = (opt.get('align')?.value || 'yes') == 'yes' ? true : false;
    data.supress = (opt.get('supress')?.value || 'no') == 'yes' ? true : false;
    data.subjects = opt.get('subjects')?.value.split(' ').map(subj => { return 'cs' + subj; }) || [];
    data.startDate = (data.align == 'yes') ? getFirstDayOfWeek() : new Date();
    data.endDate = addDaysToDate(data.startDate, data.span * 7 - 1);

    return data;
}


function getInvalidSubjectInput(subjects) {
    const invalidSubjects = new Array();

    for (const subject of subjects) {
        if (!listOfSubjects.includes(subject)) {
            invalidSubjects.push(subject);
        }
    }

    return invalidSubjects;
}


function filterSubjects(events, subjects) {
    if (subjects.length) {
        for (const subject in events) {
            if (!subjects.includes(subject)) {
                delete events[subject];
            }
        }
    }
}


function getSubjectChannels(events, interaction) {
    const guildChannels = new Object();
    const missingChannels = new Array();

    interaction.guild.channels.cache.forEach((channel) => {
        if (channel.type != '0') return;
        const name = channel.name.replaceAll(/[\s_-]/g, '');
        if (listOfSubjects.includes(name)) {
            guildChannels[name] = channel;
        }
    });

    for (const subject of Object.keys(events)) {
        const channel = guildChannels[subject];
        if (!channel) {
            missingChannels.push(subject);
            delete events[subject];
        }
    };

    return { guildChannels, missingChannels };
}


function getSubjectRoles(events, interaction) {
    const guildRoles = new Object();
    const missingRoles = new Array();

    interaction.guild.roles.cache.forEach((role) => {
        const name = role.name.replaceAll(/[\s_-]/g, '');
        if (listOfSubjects.includes(name)) {
            guildRoles[name] = role;
        }
    });

    for (const subject of Object.keys(events)) {
        const role = guildRoles[subject];
        if (!role) {
            missingRoles.push(subject);
            delete events[subject];
        }
    };
    return { guildRoles, missingRoles };
}


function makeErrorScript(data, script) {

    const command = '```' + `Command: reqs [span] ${data.span} week(s), [align] ${data.align}, [supress] ${data.supress}, [subjects] ${data.subjects.length ? data.subjects : 'all'}` + '```';

    if (script.eventWarning.length != 0) script.eventWarning = `[WARNING${data.supress ? ' @Supress' : ''}] Unrecognized Events:\n` + script.eventWarning + '\n';
    if (script.channelWarning.length != 0) script.channelWarning = `[WARNING${data.supress ? ' @Supress' : ''}] Missing Channels:\n` + script.channelWarning + '\n';
    if (script.roleWarning.length != 0) script.roleWarning = `[WARNING${data.supress ? ' @Supress' : ''}] Missing Roles:\n` + script.roleWarning + '\n';

    let warnings = script.errorWarning + script.eventWarning + script.channelWarning + script.roleWarning;
    if (warnings.length != 0) warnings = '```' + warnings + '```';

    const date = `[Events from ${formatDate(data.startDate)} to ${formatDate(data.endDate)}]\n\n`;

    let logs = script.okkeScript + script.nonoScript;
    if (logs.length != 0) logs = '```' + date + logs + '```';

    const consoleScript = command + warnings + logs;

    return consoleScript;
}


async function sendEvents(data, events, guildChannels, guildRoles,) {
    const sentEvents = new Array();
    const failedEvents = new Array();

    for (const subject in events) {

        let reqScript = new String();
        events[subject].forEach((req) => {
            reqScript = reqScript.concat(`📍 **${formatDate(new Date(req['start']['date']))}**  ${req['summary']}\n`);
        });

        const msg = messageScript
            .replace('[<start>]', formatDate(data.startDate))
            .replace('[<end>]', formatDate(data.endDate))
            .replace('[<role>]', `<@&${guildRoles[subject].id}>`)
            .replaceAll('[<subject>]', subject.toUpperCase())
            .replace('[<requirements>]', reqScript);

        try {
            var sent = await guildChannels[subject].send(msg);
            sentEvents.push({ 'subject': subject, 'data': sent });
        } catch (error) {
            failedEvents.push({ 'subject': subject, 'data': sent });
        }
    }

    return { sentEvents, failedEvents };
};


async function saveLogs(interaction, events) {
    let msg = '[x]' + new Date() + '\n';
    for (const event of events) {
        const subject = events.subject;
        const messageId = event.data.id;
        const channelId = event.data.channel.id;
        msg += `${subject} ${channelId} ${messageId}\n`;
    }

    try {
        fs.appendFileSync(path.join(__dirname, `../../data/history/${interaction.guildId}.txt`), msg);
    } catch (error) {
        await interaction.followUp('[ERROR] Failed to update logs');
    }
}





// const startDate = new Date(new Date().setDate(new Date().getDate() - 24 * 7 - 1));
// const endDate = new Date(new Date().setDate(new Date().getDate() - 20 * 7 - 1));


//  =================== DEBUG ===================
// for (const event in validEvents)
//     validEvents[event].forEach(subj => console.log(subj['summary']));
//  =================== DEBUG ===================