export function applySubjectFilter(events, subjects) {
    if (!subjects.length) return events;
    return events.filter((event) => subjects.includes(event.subject));
}
