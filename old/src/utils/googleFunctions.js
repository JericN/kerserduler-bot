require('dotenv/config');
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const listOfSubjects = fs.readFileSync(path.join(__dirname, '..', 'data', 'subjects.txt'), 'utf-8').split(/\r?\n/);

// get calendar events from google calendar
// return array of events
async function getCalendarEvents(startDate, endDate) {
    // auth
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '..', '..', 'googlekey.json'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth });

    // get events

    const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_CURSOR_ID,
        orderBy: 'startTime',
        timeMin: startDate,
        timeMax: endDate,
        timeZone: 'Asia/Singapore',
        singleEvents: 'true',
    });

    return response['data']['items'];
}

// separate valid and invalid events
// return object of valid events and array of invalid events
function separateEvents(calendarEvents) {
    const validEvents = new Object();
    const invalidEvents = new Array();

    for (const event of calendarEvents) {
        // get subject code from event summary
        const subject = event.summary
            .match(/cs[ -]*\d+/i)?.[0]
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase();

        // check if subject code is valid
        if (listOfSubjects.includes(subject)) validEvents[subject] = [...(validEvents[subject] || []), event];
        else invalidEvents.push(event);
    }

    return { validEvents, invalidEvents };
}

module.exports = { getCalendarEvents, separateEvents };
