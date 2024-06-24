const fs = require('fs');
const path = require('path');
const { AcadEvents } = require('../schema/types');

const listOfSubjects = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/);

// FIXME: Add support for non-CS subjects
// It would be better if we have agreed on a standard format for event summaries
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
