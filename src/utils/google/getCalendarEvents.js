require('dotenv/config');
const { google } = require('googleapis');
const path = require('path');


module.exports = async (startDate, endDate) => {

    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../../../googlekey.json'),
        scopes: ["https://www.googleapis.com/auth/calendar"]
    });

    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_CURSOR_ID,
        orderBy: 'startTime',
        timeMin: startDate,
        timeMax: endDate,
        timeZone: 'Asia/Singapore',
        singleEvents: 'true'
    });

    return response['data']['items'];

};