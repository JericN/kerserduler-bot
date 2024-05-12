function objectToList(object) {
    return [].concat(...Object.values(object));
}

// DATE FUNCTIONS
function addDaysToDate(date, days) {
    const newdate = new Date(date);
    newdate.setDate(date.getDate() + days);
    return newdate;
}

function formatDate(date) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}

module.exports = { objectToList, addDaysToDate, formatDate };

// const { formatDate, sortEventsByDate } = require('../functions');

// function groupBySubject(events) {
//     const groupedEvents = {};

//     // Group events by subject
//     for (const event of events) {
//         if (!event.subject) {
//             throw new Error('Event must have a subject property');
//         }

//         // Initialize the subject array if it doesn't exist
//         if (!groupedEvents[event.subject]) groupedEvents[event.subject] = [];

//         // Add the event to the subject array
//         groupedEvents[event.subject].push(event);
//     }

//     for (const subject in groupedEvents) {
//         sortEventsByDate(groupedEvents[subject]);
//     }
//     groupedEvents.map((group) => sortEventsByDate(group));
//     groupedEvents.flat();
//     return groupedEvents;
// }

// function groupByDate(events) {
//     const groupedEvents = {};
//     events.forEach((event) => {
//         if (!event.start || !event.start.date) {
//             throw new Error('Event must have a start date property');
//         }

//         // Use the date string as the key
//         const date = formatDate(new Date(event.start.date));

//         // Initialize the date array if it doesn't exist
//         if (!groupedEvents[date]) groupedEvents[date] = [];

//         // Add the event to the date array
//         groupedEvents[date].push(event);
//     });

//     return groupedEvents;
// }

// /**
//  * Groups an array of events by either subject or date.
//  * @param {Object[]} events - Array of event objects to be grouped.
//  * @param {string} type - Type of grouping ('subject' or 'date').
//  * @returns {Object} An object containing the grouped events.
//  * @throws {Error} Throws an error if the type is invalid or if events are missing required properties.
//  */
// function groupEvents(events, type) {
//     if (type === 'subject') return groupBySubject(events);
//     if (type === 'date') return groupByDate(events);
//     throw new Error('Invalid group type');
// }

// module.exports = groupEvents;
