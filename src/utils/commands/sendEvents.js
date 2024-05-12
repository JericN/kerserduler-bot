const fs = require('fs');
const path = require('path');
const { formatDate } = require('../functions');

const messageScript = fs.readFileSync(path.join(__dirname, '../../data/scripts/event_message.txt'), 'utf-8');

async function sendEventsToChannels(events, dates, threads, roles) {
    const successfulEvents = [];
    const failedEvents = [];

    for (const subject in events) {
        const reqsScript = events[subject]
            .map((reqs) => `📍 **${formatDate(new Date(reqs.start.date))}**  ${reqs.summary}`)
            .join('\n');

        const msg = messageScript
            .replace('[<start>]', formatDate(dates.start))
            .replace('[<end>]', formatDate(dates.end))
            .replace('[<role>]', `<@&${roles[subject].id}>`)
            .replaceAll('[<subject>]', subject.toUpperCase())
            .replace('[<requirements>]', reqsScript);

        let response;
        const data = events[subject];
        try {
            response = await threads[subject].send(msg);
            successfulEvents.push({ subject, data, response });
        } catch {
            failedEvents.push({ subject, data, response });
        }
    }

    return { successfulEvents, failedEvents };
}

module.exports = sendEventsToChannels;
