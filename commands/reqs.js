const { google } = require('googleapis')
const fs = require('fs')
const { channel } = require('diagnostics_channel')
require('dotenv/config')

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

function dateFormat(date) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' })
}

module.exports = {
    name: "Send Requirements",
    code: "reqs",

    async execute(client, message) {
        let startDate = new Date()
        let endDate = new Date(new Date().setDate(startDate.getDate() + 7))

        // Load script template
        const script = fs.readFileSync('./data/script.txt', 'utf-8')

        // Get respective channel for each subject
        const subjects = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n')
        var acadChannels = new Map()
        message.guild.channels.cache.forEach((channel) => {
            for (subject of subjects) {
                if (channel.name.includes(subject)) {
                    acadChannels.set(channel.name, channel)
                    break
                }
            }
        })

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

        // Send Events to their respective channels
        const sendEvents = async (items) => {

            // Collect events of identical subjects
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

            // Find the correct channel for each subject and send the message
            for (var subject in events) {
                var strLine = ''
                for (var reqs of events[subject]) {
                    var topic = reqs['summary']
                    var dateObj = dateFormat(new Date(reqs['start']['date']))
                    strLine = strLine.concat('📍 **' + dateObj + '**  ' + topic + '\n')
                }

                for (var channel of acadChannels) {
                    if (subject == channel[0].substring(2)) {
                        await client.channels.fetch(channel[1].id).then(async (channel) => {
                            var msg = script.replace('[<start>]', dateFormat(startDate))
                                .replace('[<end>]', dateFormat(endDate))
                                .replaceAll('[<subject>]', subject)
                                .replace('[<requirements>]', strLine)
                            await channel.send(msg)
                            fs.appendFileSync('./data/recent_message.txt', channel.id + ' ' + channel.lastMessageId + '\n')
                        }); break
                    }
                }
            }
        }

        getEvents(startDate, endDate)
    }
}
