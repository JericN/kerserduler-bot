const { google } = require('googleapis')
require('dotenv/config')

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

// Initialize Google Calendar and Cloud Service
const calendar = google.calendar({ version: "v3" })
const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    ["https://www.googleapis.com/auth/calendar"]
)



// Get list of events from google calendar
const getEvents = async (startDate, endDate) => {
    try {
        let response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDate,
            timeMax: endDate,
            timeZone: 'Asia/Singapore'
        })

        sendEvents(response['data']['items'])
    } catch (error) {
        console.log(`Error at getEvents --> ${error}`)
        return 0
    }
}

const sendEvents = (items) => {
    console.log(items.length)
    var events = new Object
    for (let i = 0; i < items.length; i++) {
        if (items[i] == null) continue
        var subj = items[i].summary.split(' ')[1]
        events[subj] = [items[i]]
        for (let j = i + 1; j < items.length; j++) {
            if (items[j] == null) continue
            var xSubj = items[j].summary.split(' ')[1]
            if (subj == xSubj) {
                events[subj].push(items[j])
                items[j] = null
            }
        }
    }
    console.log(events)
    // const events = new Object()
    // for (var item of items) {
    //     var subj = item.summary.split(' ')[1]
    //     events.subj = [item]
    //     for (var n of items) {
    //         if (item == n) continue
    //         if (subj == n.summary.split(' ')[1]) {
    //             events.subj.push(n)

    //         }
    //     }
    // }
}

let startDate = new Date()
let endDate = new Date(new Date().setDate(startDate.getDate() + 14))
getEvents(startDate, endDate)