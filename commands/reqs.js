const { google } = require('googleapis')
const fs = require('fs')
require('dotenv/config')
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

module.exports = {
    name: "Send Requirements",
    code: "reqs",

    async execute(client, message) {

        const subjects = fs.readFileSync('./subjects.txt', 'utf-8').split('\n')
        var acadChannels = new Map()
        message.guild.channels.cache.forEach((channel) => {
            for (subject of subjects) {
                if (channel.name.includes(subject)) {
                    acadChannels.set(channel.name, channel)
                    break
                }
            }
        })


        const calendar = google.calendar({ version: "v3" })
        const auth = new google.auth.JWT(
            CREDENTIALS.client_email,
            null,
            CREDENTIALS.private_key,
            ["https://www.googleapis.com/auth/calendar"]
        )

        const getEvents = async (startDate, endDate) => {
            try {
                let response = await calendar.events.list({
                    auth: auth,
                    calendarId: CALENDAR_ID,
                    timeMin: startDate,
                    timeMax: endDate,
                    timeZone: 'Asia/Singapore'
                })

                let items = response['data']['items']
                return items
            } catch (error) {
                console.log(`Error at getEvents --> ${error}`)
                return 0
            }
        }




        const send = async (items) => {
            for (item of items) {
                for (channel of acadChannels) {

                    var a = channel[0].substring(2)
                    var b = item.summary.split(' ')[1]

                    if (a == b) {
                        var topic = item['summary']
                        var dateObj = new Date(item['start']['date']).toLocaleString('default', { month: 'long', day: 'numeric' })
                        console.log(topic + ' on ' + dateObj)
                        await client.channels.fetch(channel[1].id).then((channel) => {
                            channel.send(topic + ' on ' + dateObj)
                        })

                    }
                }

            }
        }





        let startDate = new Date()
        let endDate = new Date(new Date().setDate(startDate.getDate() + 7))

        getEvents(startDate, endDate)
            .then((res) => {
                console.log('success')
                send(res)
            })
            .catch((err) => {
                console.log(err)
            })

    }
}
