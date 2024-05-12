const { formatDate } = require('../functions');

function wrap(text) {
    return '```asciidoc\n' + text + '\n```';
}

function format(event) {
    const eventDate = formatDate(new Date(event.start.date));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

function generateSendOutputScript(sentEvents, failedEvents) {
    const script = {
        sentEvents: '',
        failedEvents: '',
    };

    if (sentEvents.length > 0) {
        const sentScripts = sentEvents.map((events) => events.data.map((event) => format(event)).join('\n'));
        script.sentEvents = wrap(`[ Successfully Sent Events ]\n${sentScripts.join('\n')}`);
    }

    if (failedEvents.length > 0) {
        console.log('hereeeeeXX', failedEvents);
        const failedScripts = failedEvents.map((events) => events.data.map((event) => format(event)).join('\n'));
        script.failedEvents = wrap(`[ Failed to Send Events ]\n${failedScripts.join('\n')}`);
    }

    return script.sentEvents + script.failedEvents;
}

module.exports = generateSendOutputScript;
