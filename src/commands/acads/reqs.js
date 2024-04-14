const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');
const { getCalendarEvents, separateEvents } = require('../../utils/googleFunctions.js');
const {
    addDaysToDate,
    formatDate,
    getFirstDayOfWeek,
    makeEventListScript,
} = require('../../utils/generalFunctions.js');

const listOfSubjects = fs.readFileSync(path.join(__dirname, '../../data/subjects.txt'), 'utf-8').split(/\r?\n/);
const messageScript = fs.readFileSync(path.join(__dirname, '../../data/scripts/event_message.txt'), 'utf-8');

module.exports = {
    deleted: false,
    name: 'reqs',
    description: 'send list of requirements to their respective channels',
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
            description: 'Start with with first day of the week (sunday). [ default : true ]',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
            choices: [
                { name: 'yes', value: true },
                { name: 'no', value: false },
            ],
            default: true,
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
    ],
    allowedServerOnly: true,

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const script = new Object({
            errorWarning: '',
            eventWarning: '',
            channelWarning: '',
            roleWarning: '',
            nonoScript: '',
            okkeScript: '',
        });

        // get command options and set search span
        const opt = getOptionValues(interaction.options);
        const dates = getSearchDates(opt.span, opt.align);

        // input checking
        try {
            verifyInput(opt);
        } catch (error) {
            script.errorWarning = error.message;
            await interaction.editReply(makeErrorScript(opt, dates, script));
            return;
        }

        // get list of desired events from google calendar
        let calendarEvents;
        try {
            calendarEvents = await getCalendarEvents(dates.start, dates.end);
        } catch (error) {
            script.errorWarning = '[ERROR] Calendar Request Failed';
            await interaction.editReply(makeErrorScript(opt, dates, script));
            return;
        }

        // separate valid and invalid events
        const { validEvents, invalidEvents } = separateEvents(calendarEvents);

        // apply options
        const filteredEvents = filterValidEvents(validEvents, opt.subjects);

        // get corresponding subject channels and check for missing channels
        const { guildChannels, missingChannels } = verifyChannels(filteredEvents, interaction);

        // get guild roles and check for missing roles
        const { guildRoles, missingRoles } = verifyRoles(filteredEvents, interaction);

        // make warning script
        const warningFlag = warningHandler(script, opt.subjects, invalidEvents, missingChannels, missingRoles);

        // End program if warning flag is raised and force is true
        if (!opt.force && warningFlag) {
            await interaction.editReply(makeErrorScript(opt, dates, script));
            return;
        }

        // remove invalid events
        const finalEvents = removeInvalidEvents(filteredEvents, missingChannels, missingRoles);

        // Find the corresponding channel for each subject, send the message and save the logs.
        const { sentEvents, failedEvents } = await sendEvents(dates, finalEvents, guildChannels, guildRoles);

        // make and send result script
        sentEvents.forEach(event => {
            script.okkeScript += `${event['subject'].replace('cs', '[SENT] CS ')}\n`;
        });
        failedEvents.forEach(event => {
            script.nonoScript += `${event['subject'].replace('cs', '[FAILED] CS ')}\n`;
        });
        await interaction.editReply(makeErrorScript(opt, dates, script));

        // save sent messages to history
        await saveLogs(interaction, sentEvents);
    },
};

function getOptionValues(options) {
    const optionValues = new Object();
    module.exports.options.forEach(option => {
        optionValues[option.name] = options.get(option.name)?.value || option.default;
    });

    optionValues.subjects = optionValues.subjects?.split(' ').map(subj => 'cs' + subj) || [];
    return optionValues;
}

function getSearchDates(span, align) {
    const start = align ? getFirstDayOfWeek() : new Date();
    const end = addDaysToDate(start, span * 7 - 1);
    return { start, end };
}

function verifyInput(opt) {
    const invalidSubjectsInput = opt.subjects.filter(subject => !listOfSubjects.includes(subject));

    if (invalidSubjectsInput.length) {
        throw new Error(`[ERROR] Invalid Input (subjects) : ${invalidSubjectsInput.join(', ')}`);
    }
}

function filterValidEvents(validEvents, subjects) {
    if (!subjects.length) return validEvents;

    const filteredEvents = Object.keys(validEvents)
        .filter(event => subjects.includes(event))
        .reduce((result, event) => {
            result[event] = validEvents[event];
            return result;
        }, {});

    return filteredEvents;
}

function verifyChannels(events, interaction) {
    const guildChannels = {};
    const missingChannels = [];

    interaction.guild.channels.cache
        .filter(channel => channel.type === 0)
        .forEach(channel => {
            const name = channel.name.replace(/[\s_-]/g, '');
            if (listOfSubjects.includes(name)) {
                guildChannels[name] = channel;
            }
        });

    for (const subject in events) {
        if (!guildChannels[subject]) {
            missingChannels.push(subject);
        }
    }

    return { guildChannels, missingChannels };
}

function verifyRoles(events, interaction) {
    const guildRoles = {};
    const missingRoles = [];

    interaction.guild.roles.cache.forEach(role => {
        const name = role.name.replace(/[\s_-]/g, '');
        if (listOfSubjects.includes(name)) {
            guildRoles[name] = role;
        }
    });

    for (const subject in events) {
        if (!guildRoles[subject]) {
            missingRoles.push(subject);
        }
    }

    return { guildRoles, missingRoles };
}

function warningHandler(script, subjects, invalidEvents, missingChannels, missingRoles) {
    let warningFlag = false;

    if (!subjects.length && invalidEvents.length) {
        script.eventWarning = makeEventListScript(invalidEvents);
        warningFlag = true;
    }

    if (missingChannels.length) {
        script.channelWarning = missingChannels.map(subject => subject.replace('cs', 'CS ')).join('\n');
        warningFlag = true;
    }

    if (missingRoles.length) {
        script.roleWarning = missingRoles.map(subject => subject.replace('cs', 'CS ')).join('\n');
        warningFlag = true;
    }
    return warningFlag;
}

function removeInvalidEvents(events, missingChannels, missingRoles) {
    missingChannels.forEach(subject => {
        delete events[subject];
    });
    missingRoles.forEach(subject => {
        delete events[subject];
    });

    return events;
}

async function sendEvents(dates, events, guildChannels, guildRoles) {
    const sentEvents = [];
    const failedEvents = [];

    for (const subject in events) {
        let reqsScript = '';
        events[subject].forEach(reqs => {
            reqsScript += `📍 **${formatDate(new Date(reqs['start']['date']))}**  ${reqs['summary']}\n`;
        });

        const msg = messageScript
            .replace('[<start>]', formatDate(dates.start))
            .replace('[<end>]', formatDate(dates.end))
            .replace('[<role>]', `<@&${guildRoles[subject].id}>`)
            .replaceAll('[<subject>]', subject.toUpperCase())
            .replace('[<requirements>]', reqsScript);

        let sent;
        try {
            sent = await guildChannels[subject].send(msg);
            sentEvents.push({ subject: subject, data: sent });
        } catch (error) {
            failedEvents.push({ subject: subject, data: sent });
        }
    }

    return { sentEvents, failedEvents };
}

function makeErrorScript(opt, dates, script) {
    const command =
        '```' +
        `Command: reqs [span] ${opt.span} week(s), [align] ${opt.align}, [force] ${opt.force}, [subjects] ${
            opt.subjects.length ? opt.subjects.join(', ') : 'all'
        }` +
        '```';

    if (script.eventWarning.length) {
        script.eventWarning =
            `[WARNING${opt.force ? ' @Supress' : ''}] Unrecognized Events:\n` + script.eventWarning + '\n';
    }

    if (script.channelWarning.length) {
        script.channelWarning =
            `[WARNING${opt.force ? ' @Supress' : ''}] Missing Channels:\n` + script.channelWarning + '\n';
    }

    if (script.roleWarning.length) {
        script.roleWarning = `[WARNING${opt.force ? ' @Supress' : ''}] Missing Roles:\n` + script.roleWarning + '\n';
    }

    let warnings = script.errorWarning + script.eventWarning + script.channelWarning + script.roleWarning;
    if (warnings.length != 0) warnings = '```' + warnings + '```';

    const date = `[Events from ${formatDate(dates.start)} to ${formatDate(dates.end)}]\n\n`;

    let logs = script.okkeScript + script.nonoScript;
    if (logs.length != 0) logs = '```' + date + logs + '```';

    const consoleScript = command + warnings + logs;

    return consoleScript;
}

async function saveLogs(interaction, events) {
    let msg = `[x] ${new Date()}\n`;
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
