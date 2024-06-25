import fs from 'fs';
import path from 'path';
import { AcadEvent, FilteredEvents} from '../types/types';

const listOfSubjects = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/);

// FIXME: Add support for non-CS subjects
// It would be better if we have agreed on a standard format for event summaries
function extractSubjectCode(event: AcadEvent): string | null {
    const subjectMatch = event.summary.match(/\bCS?\s*[-_]?\s*\d{2,3}\b/i);
    if (subjectMatch) {
        const subjectCode = subjectMatch[0].toLowerCase();
        return subjectCode.replace(/[^a-z0-9]/g, '');
    }
    return null;
}

export function filterEvents(events: AcadEvent[]): FilteredEvents{
    const validEvents: AcadEvent[] = [];
    const invalidEvents: AcadEvent[] = [];

    // Filter events based on subject code
    for (const event of events) {
        const subject = extractSubjectCode(event);

        if (subject !== null && listOfSubjects.includes(subject)) {
            validEvents.push({ ...event, subject: subject });
        } else {
            invalidEvents.push(event);
        }
    }

    return { validEvents, invalidEvents };
}
