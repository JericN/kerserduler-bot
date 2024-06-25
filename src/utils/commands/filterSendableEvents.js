export function filterSendableEvents(events, missingThreads, missingRoles) {
    const filteredEvents = [];
    for (const event of events) {
        if (missingThreads.includes(event['subject'])) {
            continue;
        }
        if (missingRoles.includes(event['subject'])) {
            continue;
        }
        filteredEvents.push(event);
    }
    return filteredEvents;
}
