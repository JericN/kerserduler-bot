const fs = require('fs');
const path = require('path');

const listOfSubjects = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/);

function extractSubjectCode(event) {
    const subjectMatch = event.summary.match(/cs[ -_]*\d+/i);
    return subjectMatch?.[0]?.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function isValidSubjectCode(subject) {
    return subject && listOfSubjects.includes(subject);
}

/**
 * Validates calendar events based on subjects codes.
 * @param {Array<Object>} events - An array of calendar event objects to validate.
 * @returns {{ validEvents: Object[], invalidEvents: Object[] }} An object containing valid and invalid events.
 **/
function validateEvents(events) {
    const validEvents = [];
    const invalidEvents = [];

    for (const event of events) {
        const subject = extractSubjectCode(event);
        const isValidSubject = isValidSubjectCode(subject);

        if (isValidSubject) {
            validEvents.push({ subject: subject, ...event });
        } else {
            invalidEvents.push(event);
        }
    }

    return { validEvents, invalidEvents };
}

module.exports = validateEvents;
