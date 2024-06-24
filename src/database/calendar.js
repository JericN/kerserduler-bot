const { google } = require('googleapis');
const path = require('path');
const { TransformEvents } = require('../utils/schema/types');

// FIXME: secure the keyFile
function getAuth() {
    return new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '..', '..', 'googlekey.json'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });
}

async function fetchGoogleCalendarEvents(startDate, endDate) {
    const auth = getAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    // Retrieve events from the calendar
    const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_CURSOR_ID,
        orderBy: 'startTime',
        singleEvents: true,
        timeMin: startDate,
        timeMax: endDate,
        timeZone: 'Asia/Singapore',
    });

    // Extract and return the events from the response data
    const temp = TransformEvents.safeParse(response.data.items);
    if (!temp.success) throw new Error('Failed to parse events');
    return temp.data;
}

module.exports = { fetchGoogleCalendarEvents };
