const { formatDate } = require('../functions');

function format(event) {
    const eventDate = formatDate(new Date(event.start.date));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

function makeEventListScript(groups) {
    // Format the events into a script
    let script = Object.values(groups)
        .map((group) => group.map((event) => format(event)).join('\n'))
        .join('\n');

    // Add a header to the script
    if (script.length) script = `[ Valid Events Found ]\n${script}`;
    else script = '[ No Valid Event Found ]';

    // Return the formatted script
    return '```asciidoc\n' + script + '\n```';
}

module.exports = makeEventListScript;
