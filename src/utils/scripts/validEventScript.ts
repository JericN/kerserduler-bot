import { AcadEvent, GroupedEvents } from '../types/types';
import { formatDate } from '../functions';

function format(event: AcadEvent) {
    const eventDate = formatDate(new Date(event.startDate));
    return `${eventDate.padEnd(6)} - ${event.summary}`;
}

export function generateValidEventScript(groups: GroupedEvents): string {
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
