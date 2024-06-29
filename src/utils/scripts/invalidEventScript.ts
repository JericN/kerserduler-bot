import { AcadEvent } from '../types/types';
import { formatDate } from '../functions';

function formatScript(event: AcadEvent) {
    const eventDate = formatDate(new Date(event.startDate));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

export function generateInvalidEventScript(events: AcadEvent[]): string {
    // Format the events into a script
    let script = events.map((event) => formatScript(event)).join('\n');

    // Add a header to the script
    if (script.length) script = `[ Invalid Events Found ]\n${script}`;
    else script = '[ No Invalid Event Found ]';

    // Return the formatted script
    return '```asciidoc\n' + script + '\n```';
}
