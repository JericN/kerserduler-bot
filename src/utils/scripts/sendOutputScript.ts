import { AcadEvent, DiscordEvent } from '../types/types';
import { formatDate } from '../functions';

function wrap(text: string) {
    return '```asciidoc\n' + text + '\n```';
}

function format(event: AcadEvent) {
    const eventDate = formatDate(new Date(event.startDate));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

export function generateSendOutputScript(sentEvents: DiscordEvent[], failedEvents: DiscordEvent[]) {
    const script = {
        sentEvents: '',
        failedEvents: '',
    };

    if (sentEvents?.length > 0) {
        const sentScripts = sentEvents.map((subject) => subject.events.map((event) => format(event)).join('\n'));
        script.sentEvents = wrap(`[ Successfully Sent Events ]\n${sentScripts.join('\n')}`);
    }

    if (failedEvents?.length > 0) {
        const failedScripts = failedEvents.map((subject) => subject.events.map((event) => format(event)).join('\n'));
        script.failedEvents = wrap(`[ Failed to Send Events ]\n${failedScripts.join('\n')}`);
    }

    const output = script.sentEvents + script.failedEvents;
    return output ? output : wrap('[ No Events to Send ]');
}
