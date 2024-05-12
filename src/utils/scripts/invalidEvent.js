const { formatDate } = require('../functions');

function formatScript(event) {
    const eventDate = formatDate(new Date(event.start.date));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

function generateInvalidEventScript(events) {
    // Format the events into a script
    let script = events.map((event) => formatScript(event)).join('\n');

    // Add a header to the script
    if (script.length) script = `[ Invalid Events Found ]\n${script}`;
    else script = '[ No Invalid Event Found ]';

    // Return the formatted script
    return '```asciidoc\n' + script + '\n```';
}

module.exports = generateInvalidEventScript;
