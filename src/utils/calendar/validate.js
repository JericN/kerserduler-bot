const fs = require('fs');
const path = require('path');

const listOfSubjects = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/);

function extractSubjectCode(event) {
    const subjectMatch = event.summary.match(/\bCS?\s*[-_]?\s*\d{2,3}\b/i);
    if (subjectMatch) {
        const subjectCode = subjectMatch[0].toLowerCase();
        return subjectCode.replace(/[^a-z0-9]/g, '');
    }
    return null;
}

function isValidSubjectCode(subject) {
    return subject && listOfSubjects.includes(subject);
}

/**
 * Validates calendar events based on subjects codes.
 * @param {Array<Object>} events - An array of calendar event objects to validate.
 * @returns {{ validEvents: Object[], invalidEvents: Object[] }} An object containing valid and invalid events.
 **/
function filterValidEvents(events) {
    const validEvents = [];
    const invalidEvents = [];

    // Filter events based on subject code
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

module.exports = filterValidEvents;
