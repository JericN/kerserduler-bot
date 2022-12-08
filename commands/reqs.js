const { google } = require('googleapis')
const fs = require('fs')
const { rejects } = require('assert')
require('dotenv/config')


// Format date to <month> <day>
function dateFormat(date) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' })
}

function getFirstDayOfWeek() {
    const date = new Date()
    const day = date.getDay()
    const diff = date.getDate() - day

    return new Date(date.setDate(diff))
}

// Get respective channel for each subject
const getChannels = (guild) => {
    const subjects = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n')
    let acadChannels = new Object()
    guild.channels.cache.forEach((channel) => {
        const name = channel.name.replaceAll(/[\s_-]/g, '')
        if (subjects.includes(name)) {
            acadChannels[name] = channel
        }
    })
    return acadChannels
}


// Get list of events from google calendar
const getEvents = async (startDate, endDate) => {
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
    return response['data']['items']
}

// Organize events, collect similar subjects
const categorizeEvents = (message, args, startDate, calEvents) => {
    const subjNames = ['math', 'physics', 'cs']
    let newEvents = new Object
    for (req of calEvents) {
        const a = new Date(req['start']['date']).getTime()
        const b = new Date(startDate).getTime()
        if (a < b) continue

        let [name, num] = req.summary.split(' ')
        name = name.toLowerCase()

        if (!subjNames.includes(name)) {
            console.log('[WARNING] Calendar Event <' + req.summary + '> is not recognized')
            if (!args) message.channel.send('```css\n[WARNING] Calendar Event ' + req.summary + ' is not recognized\n```')
            continue
        }

        const subj = name + num
        if (newEvents[subj]) {
            newEvents[subj].push(req)
        } else {
            newEvents[subj] = [req]
        }
    }

    return newEvents
}

// Send Events to their respective channels
const sendEvents = async (client, message, startDate, endDate, targetSubjects, acadChannels, newEvents) => {
    const script = fs.readFileSync('./data/script.txt', 'utf-8')
    let log = new String().concat('#step\n')
    let counter = 0
    for (let subject in newEvents) {
        if (targetSubjects != 0 && !targetSubjects.includes(subject)) continue

        const currChannel = acadChannels[subject]
        if (!currChannel) {
            console.log('[WARNING] No <' + subject + '> channel found!')
            message.channel.send('```css\n[WARNING] Channel for ' + subject + ' is not recognized\n```')
            continue
        }

        let channel = await client.channels.fetch(currChannel.id)

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

        channel = await client.channels.fetch(currChannel.id)
        log = log
            .concat(subject + ' ')
            .concat(channel.id + ' ')
            .concat(channel.lastMessageId + '\n')
        counter = counter + 1
    }
    if (counter != 0) {
        fs.appendFileSync('./data/recent_message.txt', log)
    }

    message.channel.send('```css\n#Success Update sent in ' + counter + ' channel(s)\n```')
}


// Argument checking

const checkArgs = (userInputs) => {
    const listOfSubjects = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n')
    const invalidInputs = new Array()

    for (subj of userInputs) {
        if (!listOfSubjects.includes(subj)) {
            invalidInputs.push(subj)
        }
    }
    if (invalidInputs.length == 0) {
        return userInputs
    } else {
        throw invalidInputs
    }
}


module.exports = {
    name: "Send Requirements",
    code: "reqs",
    desc: "",

    async execute(client, guild, message, args) {
        args = args.split(',').filter(Boolean)
        if (args[0] == 'week') {
            var startDate = getFirstDayOfWeek(new Date())
            var endDate = new Date(new Date().setDate(startDate.getDate() + 8))
            args.shift()
        } else {
            startDate = new Date()
            endDate = new Date(new Date().setDate(startDate.getDate() + 8))
        }

        // Get list of target subjects
        try {
            var targetSubjects = checkArgs(args)
        } catch (invalidInputs) {
            console.log('[ERROR] Invalid input subject: ' + invalidInputs.toString())
            await message.channel.send('```css\n[ERROR] Invalid subject: ' + invalidInputs.toString() + '\n```')
            return
        }

        console.log('Searching date: ' + dateFormat(startDate) + ' to ' + dateFormat(endDate))
        await message.channel.send('```diff\n! Searching Date: ' + dateFormat(startDate) + ' to ' + dateFormat(endDate) + '\n```')




        // Get list of subject channel
        const acadChannels = getChannels(guild)

        // Get list of events from google calendar
        try {
            var calendarEvents = await getEvents(startDate, endDate)
        } catch (error) {
            console.log('[ERROR] Unsuccessful Google Calendar Authentication')
            message.channel.send('```css\n[ERROR] Unsuccessful Google Calendar Authentication\n```')
            return
        }

        // Organize events, collect similar subjects
        let newEvents = categorizeEvents(message, args, startDate, calendarEvents)

        // Find the correct channel for each subject and send the message
        sendEvents(client, message, startDate, endDate, targetSubjects, acadChannels, newEvents)
    }
}
