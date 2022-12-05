const { google } = require('googleapis')
require('dotenv/config')

module.exports = {
    name: "Send Requirements",
    code: "reqs",

    async execute(client, message) {

        const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

        const calendar = google.calendar({ version: "v3" })
        const SCOPES = ["https://www.googleapis.com/auth/calendar"]
        const auth = new google.auth.JWT(
            CREDENTIALS.client_email,
            null,
            CREDENTIALS.private_key,
            SCOPES
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

        let startDate = new Date()
        let endDate = new Date(new Date().setDate(startDate.getDate() + 7))


        const send = async (items) => {
            for (item in items) {
                await message.channel.send(items[item]['summary'])
            }
        }

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
