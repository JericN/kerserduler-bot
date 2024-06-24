const { formatDate } = require('../functions');

function groupBySubject(events) {
    const groupedEvents = {};

    // Group events by subject
    events.forEach((event) => {
        if (!event.subject) throw new Error('Event missing subject property');
        if (!groupedEvents[event.subject]) groupedEvents[event.subject] = [];
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

    // Group events by date
    events.forEach((event) => {
        if (!event.start || !event.start.date) throw new Error('Event missing date property');
        const date = formatDate(new Date(event.start.date));
        if (!groupedEvents[date]) groupedEvents[date] = [];
        groupedEvents[date].push(event);
    });

    // Sort events by subject
    for (const date in groupedEvents) {
        groupedEvents[date].sort((a, b) => a.subject.localeCompare(b.subject));
    }

    return groupedEvents;
}

function groupEvents(events, type) {
    if (type === 'subject') return groupBySubject(events);
    if (type === 'date') return groupByDate(events);
    throw new Error('Invalid group type');
}

module.exports = groupEvents;
