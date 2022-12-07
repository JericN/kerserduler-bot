const { google } = require('googleapis')
const fs = require('fs')
require('dotenv/config')

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

module.exports = {
    name: "Delete Recent Upate",
    code: "undo",

    async execute(client, message) {
        const msgData = fs.readFileSync('./data/recent_message.txt', 'utf-8').split('\n')
        msgData.pop()
        msgData.forEach(async (el) => {
            const data = el.split(' ')
            const channel = client.channels.cache.get(data[0])
            try {
                const message = await channel.messages.fetch(data[1])
                message.delete()
            } catch (error) {
                console.log('message is already deleted')
            }
        })
        fs.writeFileSync('./data/recent_message.txt', '')
    }
}