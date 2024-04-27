const { formatDate } = require('../functions');

function formatScript(event) {
    const eventDate = formatDate(new Date(event.start.date));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

function makeEventListScript(events) {
    return events.map((event) => formatScript(event)).join('\n');
}

module.exports = makeEventListScript;
