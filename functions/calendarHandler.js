require('dotenv/config')
const { google } = require('googleapis')
const fs = require('fs')
const listOfSubject = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n').filter(Boolean)

const getCalendarEvents = async (startDate, endDate) => {
    const calendar = google.calendar({ version: "v3" })
    const auth = new google.auth.JWT(
        process.env.GCP_CLIENT_EMAIL,
        null,
        process.env.GCP_PRIVATE_KEY,
        ["https://www.googleapis.com/auth/calendar"]
    )
    const response = await calendar.events.list({
        auth: auth,
        calendarId: process.env.GOOGLE_CALENDAR_CURSOR_ID,
        timeMin: startDate,
        timeMax: endDate,
        timeZone: 'Asia/Singapore'
    })
    let calendarEvents = response['data']['items']

    for (req in calendarEvents) {
        const dateA = new Date(calendarEvents[req]['start']['date']).getTime()
        const dateB = new Date(startDate).getTime()
        if (dateA < dateB) {
            calendarEvents[req] = ''
        }
    }

    return calendarEvents.filter(Boolean)
}
const getEvents = async (targetSubjects, startDate, endDate) => {

    const calendarEvents = await getCalendarEvents(startDate, endDate)

    let validEvents = new Object
    let invalidEvents = new Array

    for (req of calendarEvents) {
        let [name, num] = req.summary.split(' ')
        name = name.toLowerCase()
        const subj = name + num

        if (!listOfSubject.includes(subj)) {
            invalidEvents.push(req.summary)
            continue
        }

        if (targetSubjects.length != 0 && !targetSubjects.includes(subj)) continue

        if (validEvents[subj]) {
            validEvents[subj].push(req)
        } else {
            validEvents[subj] = [req]
        }
    }
    return { validEvents, invalidEvents }
}

module.exports = { getEvents, getCalendarEvents }