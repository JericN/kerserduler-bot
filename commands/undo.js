const { google } = require('googleapis')
const fs = require('fs')
require('dotenv/config')

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

module.exports = {
    name: "Delete Recent Upate",
    code: "undo",

    async execute(client, guild, message, args) {
        let hist = fs.readFileSync('./data/recent_message.txt', 'utf-8').split('\n')
        const index = hist.lastIndexOf('#step')
        const recentMessages = hist.slice(index + 1, hist.length - 1)

        recentMessages.forEach(async (msgData) => {
            msgData = msgData.split(' ')
            const channel = client.channels.cache.get(msgData[1])
            try {
                const message = await channel.messages.fetch(msgData[2])
                message.delete()
                console.log('[LOGS] Message is deleted from <' + msgData[0] + '>')
            } catch (error) {
                console.log('[WARNING] Message does not exist!')
            }
        })

        hist = hist.slice(0, index).toString().replaceAll(',', '\n').concat('\n')
        fs.writeFileSync('./data/recent_message.txt', hist)
        message.channel.send(':partying_face: **[SUCCESS]** Message deleted :ghost:')
    }
}