const { getCalendarEvents } = require('../functions/calendarHandler.js')

function dateFormat(date) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' })
}

function getFirstDayOfWeek() {
    const date = new Date()
    const day = date.getDay()
    const diff = date.getDate() - day
    return new Date(date.setDate(diff))
}

module.exports = {
    name: "Get list Events",
    code: "list",

    async execute(client, guild, message, args) {
        args.split(',').filter(Boolean)
        if (args.includes('week')) {
            var startDate = getFirstDayOfWeek(new Date())
            var endDate = new Date(new Date().setDate(startDate.getDate() + 8))
        } else {
            startDate = new Date()
            endDate = new Date(new Date().setDate(startDate.getDate() + 8))
        }
        try {
            var calendarEvents = await getCalendarEvents(startDate, endDate)
        } catch (error) {
            console.log(error)
            console.log('[ERROR] Unsuccessful Google Calendar Authentication')
            await message.channel.send('```css\n[ERROR] Unsuccessful Google Calendar Authentication\n```')
            await message.react('❎')
            return
        }

        // console.log(calendarEvents)
        let script = new String().concat('```md\n#[ ' + dateFormat(startDate) + ' to ' + dateFormat(endDate) + ' ]\n')
        for (req of calendarEvents) {
            script = script.concat(dateFormat(new Date(req['start']['date'])) + ' ' + req.summary + '\n')
        }
        script = script.concat('\n```')
        await message.channel.send(script)
        message.react('✅')
    }
}