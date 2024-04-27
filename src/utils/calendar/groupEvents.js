const { formatDate } = require('../functions');

function groupBySubject(events) {
    const groupedEvents = {};

    events.forEach((event) => {
        // Check if event has a subject property
        if (!event.subject) throw new Error('Event missing subject property');

        // Initialize the subject array if it doesn't exist
        if (!groupedEvents[event.subject]) groupedEvents[event.subject] = [];

        // Add the event to the subject array
        groupedEvents[event.subject].push(event);
    });

    // Sort events by date
    for (const subject in groupedEvents) {
        groupedEvents[subject].sort((a, b) => new Date(a.start.date) - new Date(b.start.date));
    }

    return groupedEvents;
}

function groupByDate(events) {
    const groupedEvents = {};

    events.forEach((event) => {
        // Check if event has a start date property
        if (!event.start || !event.start.date) throw new Error('Event missing date property');

        // Use the date string as the key
        const date = formatDate(new Date(event.start.date));

        // Initialize the date array if it doesn't exist
        if (!groupedEvents[date]) groupedEvents[date] = [];

        // Add the event to the date array
        groupedEvents[date].push(event);
    });

    // Sort events by subject
    for (const date in groupedEvents) {
        groupedEvents[date].sort((a, b) => a.subject.localeCompare(b.subject));
    }

    return groupedEvents;
}

/**
 * Groups an array of events by either subject or date.
 * @param {Object[]} events - Array of event objects to be grouped.
 * @param {string} type - Type of grouping ('subject' or 'date').
 * @returns {Object} An object containing the grouped events.
 * @throws {Error} Throws an error if the type is invalid or if events are missing required properties.
 */
function groupEvents(events, type) {
    if (type === 'subject') return groupBySubject(events);
    if (type === 'date') return groupByDate(events);
    throw new Error('Invalid group type');
}

module.exports = groupEvents;
