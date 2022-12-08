const { google } = require('googleapis')
const fs = require('fs')
require('dotenv/config')

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

const deleteMessage = async (client, message, msgData, counter) => {
    msgData = msgData.split(' ')
    const channel = client.channels.cache.get(msgData[1])
    try {
        const message = await channel.messages.fetch(msgData[2])
        await message.delete()
        console.log('[LOGS] Message in <' + msgData[0] + '> is deleted')
        counter = counter + 1
    } catch (error) {
        console.log('[WARNING] Message in <' + msgData[0] + '> no longer exist')
        message.channel.send('```css\n[WARNING] Message in ' + msgData[0] + ' no longer exist\n```')
    }
    return counter
}

module.exports = {
    name: "Delete Recent Upate",
    code: "undo",

    async execute(client, guild, message, args) {
        let hist = fs.readFileSync('./data/recent_message.txt', 'utf-8').split('\n')
        const index = hist.lastIndexOf('#step')
        if (index == -1) {
            console.log('[WARNING] Recent logs are empty')
            message.channel.send('```css\n[WARNING] Recent logs are empty\n```')
            return
        }

        const recentMessages = hist.slice(index + 1, hist.length - 1)
        let counter = 0
        for (msgData of recentMessages) {
            counter = await deleteMessage(client, message, msgData, counter)
        }

        hist = hist.slice(0, index).toString().replaceAll(',', '\n').concat('\n')
        fs.writeFileSync('./data/recent_message.txt', hist)

        message.channel.send('```css\n#Success ' + counter + ' message deleted\n```')
    }
}