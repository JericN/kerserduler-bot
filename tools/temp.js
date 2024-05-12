function applyFilterValidEvents(validEvents, subjects) {
    if (!subjects.length) return validEvents;

    const filteredEvents = Object.keys(validEvents)
        .filter((event) => subjects.includes(event))
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
        .filter((channel) => channel.type === 0)
        .forEach((channel) => {
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

    interaction.guild.roles.cache.forEach((role) => {
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
        script.channelWarning = missingChannels.map((subject) => subject.replace('cs', 'CS ')).join('\n');
        warningFlag = true;
    }

    if (missingRoles.length) {
        script.roleWarning = missingRoles.map((subject) => subject.replace('cs', 'CS ')).join('\n');
        warningFlag = true;
    }
    return warningFlag;
}

function filterSendableEvents(events, missingChannels, missingRoles) {
    missingChannels.forEach((subject) => {
        delete events[subject];
    });
    missingRoles.forEach((subject) => {
        delete events[subject];
    });

    return events;
}

async function sendEventsToChannels(dates, events, guildChannels, guildRoles) {
    const sentEvents = [];
    const failedEvents = [];

    for (const subject in events) {
        let reqsScript = '';
        events[subject].forEach((reqs) => {
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
