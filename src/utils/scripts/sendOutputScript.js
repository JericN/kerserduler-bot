const { formatDate } = require('../functions');

function wrap(text) {
    return '```asciidoc\n' + text + '\n```';
}

function format(event) {
    const eventDate = formatDate(new Date(event.start.date));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

export function generateSendOutputScript(sentEvents, failedEvents) {
    const script = {
        sentEvents: '',
        failedEvents: '',
    };

    if (sentEvents?.length > 0) {
        const sentScripts = sentEvents.map((events) => events.data.map((event) => format(event)).join('\n'));
        script.sentEvents = wrap(`[ Successfully Sent Events ]\n${sentScripts.join('\n')}`);
    }

    if (failedEvents?.length > 0) {
        const failedScripts = failedEvents.map((events) => events.data.map((event) => format(event)).join('\n'));
        script.failedEvents = wrap(`[ Failed to Send Events ]\n${failedScripts.join('\n')}`);
    }

    const output = script.sentEvents + script.failedEvents;
    return output ? output : wrap('[ No Events to Send ]');
}
