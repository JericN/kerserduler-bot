const { google } = require('googleapis')
const fs = require('fs')
require('dotenv/config')


// Format date to <month> <day>
function dateFormat(date) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' })
}

// Get respective channel for each subject
const getChannels = (guild) => {
    const subjects = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n')
    let acadChannels = new Object()
    guild.channels.cache.forEach((channel) => {
        if (subjects.includes(channel.name.replaceAll('-', ''))) {
            acadChannels[channel.name.replaceAll('-', '')] = channel
        }
    })
    return acadChannels
}

// Initialize Google Calendar and Cloud Service
const enableGCP = () => {
    const calendar = google.calendar({ version: "v3" })
    const auth = new google.auth.JWT(
        process.env.GCP_CLIENT_EMAIL,
        null,
        process.env.GCP_PRIVATE_KEY,
        ["https://www.googleapis.com/auth/calendar"]
    )
    return { calendar, auth }
}

// Get list of events from google calendar
const getEvents = async (calendar, auth, startDate, endDate) => {
    try {
        let response = await calendar.events.list({
            auth: auth,
            calendarId: process.env.GOOGLE_CALENDAR_CURSOR_ID,
            timeMin: startDate,
            timeMax: endDate,
            timeZone: 'Asia/Singapore'
        })

        return response['data']['items']
    } catch (error) {
        return 0
    }
}

// Organize events, collect similar subjects
const categorizeEvents = (message, args, calEvents) => {
    const subNames = ['math', 'physics', 'cs']
    let newEvents = new Object
    for (let i = 0; i < calEvents.length; i++) {
        let [name, num] = calEvents[i].summary.split(' ')
        name = name.toLowerCase()

        if (!subNames.includes(name)) {
            console.log('[WARNING] Event <' + calEvents[i].summary + '> from calendar is not recognized!')
            if (!args) message.channel.send(':scream: **[WARNING]** Calendar Event :point_right_tone1: **' + calEvents[i].summary.toUpperCase() + '** :point_left_tone1: is **not** recognized :knife:')
            continue
        }

        const subj = name + num
        if (newEvents[subj]) {
            newEvents[subj].push(calEvents[i])
        } else {
            newEvents[subj] = [calEvents[i]]
        }
    }
    return newEvents
}

// Send Events to their respective channels
const sendEvents = async (client, newEvents, acadChannels, startDate, endDate, message, args) => {
    const script = fs.readFileSync('./data/script.txt', 'utf-8')
    let log = new String().concat('#step\n')

    for (let subject in newEvents) {
        if (args && !args.includes(subject)) continue

        const currChannel = acadChannels[subject]
        if (!currChannel) {
            console.log('[WARNING]** No <' + subject + '> channel found!')
            message.channel.send(':scream: **[WARNING]** Channel for :point_right_tone1: **' + subject.toLocaleUpperCase() + '** :point_left_tone1: is **not** recognized :knife:')
            continue
        }
        await client.channels.fetch(currChannel.id).then(async (channel) => {
            let strLine = new String()
            newEvents[subject].forEach((reqs) => {
                strLine = strLine.concat('📍 **' + dateFormat(new Date(reqs['start']['date'])) + '**  ' + reqs['summary'] + '\n')
            })
            const msg = script
                .replace('[<start>]', dateFormat(startDate))
                .replace('[<end>]', dateFormat(endDate))
                .replaceAll('[<subject>]', subject)
                .replace('[<requirements>]', strLine)
            await channel.send(msg)
            console.log('[LOGS] Message is sent to <' + subject + '>')
            log = log
                .concat(subject + ' ')
                .concat(channel.id + ' ')
                .concat(channel.lastMessageId + '\n')
        })
    }
    fs.appendFileSync('./data/recent_message.txt', log)
    message.channel.send(':partying_face: **[SUCCESS]** Update sent! :books:')
}


// Argument checking

const checkArgs = (message, args) => {
    const subjects = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n')
    for (subj of args) {
        if (!subjects.includes(subj)) {
            return -1
        }
    }
    return args
}


module.exports = {
    name: "Send Requirements",
    code: "reqs",
    desc: "",

    async execute(client, guild, message, args) {
        let startDate = new Date()
        let endDate = new Date(new Date().setDate(startDate.getDate() + 7))

        args = args ? checkArgs(message, args.split(',')) : args
        if (args == -1) {
            console.log('[ERROR] Invalid subject <' + subj + '>')
            message.channel.send(':face_with_symbols_over_mouth: **[ERROR]**  Invalid subject :point_right_tone1: **' + subj.toUpperCase() + '**:point_left_tone1:')
            return
        }

        // Get list of subject channel
        let acadChannels = getChannels(guild)

        // Authenticate Google Cloud Platform
        let { calendar, auth } = enableGCP()

        // Get list of events from google calendar
        let calEvents = await getEvents(calendar, auth, startDate, endDate)
        if (!calEvents) {
            console.log('[ERROR] Unsuccessful Google Calendar Authentication')
            message.channel.send(':face_with_symbols_over_mouth: **[ERROR]**  Unsuccessful Google Calendar Authentication')
            return
        }

        // Organize events, collect similar subjects
        let newEvents = categorizeEvents(message, args, calEvents)

        // Find the correct channel for each subject and send the message
        sendEvents(client, newEvents, acadChannels, startDate, endDate, message, args)
    }
}
