const { google } = require('googleapis');
const path = require('path');

function getAuth() {
    return new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '..', '..', 'googlekey.json'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });
}

/**
 * Retrieves calendar events within a specified time range.
 * @param {Date} startDate - The start date of the time range.
 * @param {Date} endDate - The end date of the time range.
 * @returns {Promise<Object[]>} An array of calendar event objects.
 */
async function getCalendarEvents(startDate, endDate) {
    // Get authentication credentials
    const auth = getAuth();

    // Create a calendar API instance
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
    return response.data.items;
}

module.exports = { getCalendarEvents };
