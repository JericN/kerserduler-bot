import { AcadEvent } from '../types/types';

export function applySubjectFilter(events: AcadEvent[], subjects: string[]): AcadEvent[] {
    if (!subjects.length) return events;
    return events.filter((event) => subjects.includes(event.subject));
}
