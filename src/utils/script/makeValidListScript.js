const { formatDate } = require('../functions');

function formatScript(event) {
    const eventDate = formatDate(new Date(event.start.date));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

function makeEventListScript(groups) {
    const script = [];
    for (const group in groups) {
        const events = groups[group].map((event) => formatScript(event));
        script.push(events.join('\n'));
    }
    return script.join('\n');
}

module.exports = makeEventListScript;
