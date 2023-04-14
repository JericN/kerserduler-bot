const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const deleteMessage = async (client, message, msgData, counter) => {
    msgData = msgData.split(' ');
    const channel = client.channels.cache.get(msgData[1]);
    try {
        const subjMessage = await channel.messages.fetch(msgData[2]);
        await subjMessage.delete();
        console.log('[LOGS] Message in <' + msgData[0] + '> channel is deleted');
        message.channel.send('```\n[LOGS] Message in ' + msgData[0] + ' channel is deleted\n```');
        counter = counter + 1;
    } catch (error) {
        console.log('[WARNING] Message in <' + msgData[0] + '> no longer exist');
        message.channel.send('```css\n[WARNING] Message in ' + msgData[0] + ' no longer exist\n```');
    }
    return counter;
};

module.exports = {
    name: "Delete Recent Upate",
    code: "undo",

    callback: async (client, interaction) => {
        let hist = fs.readFileSync(path.join(__dirname, '../../data/history/922844835931643967.txt'), 'utf-8').split('\n');
        const index = hist.lastIndexOf('#step');
        if (index == -1) {
            console.log('[WARNING] Recent logs are empty');
            message.channel.send('```css\n[WARNING] Recent logs are empty\n```');
            message.react('❎');
            return;
        }

        const recentMessages = hist.slice(index + 1, hist.length - 1);
        let counter = 0;
        for (msgData of recentMessages) {
            counter = await deleteMessage(client, message, msgData, counter);
        }

        hist = hist.slice(0, index).toString().replaceAll(',', '\n').concat('\n');
        fs.writeFileSync('./data/recent_message.txt', hist);

        message.channel.send('```css\n#Success ' + counter + ' message deleted\n```');
        message.react('✅');
        console.log('>>>>>>>>>>>>>>>>>> DONE <<<<<<<<<<<<<<<<<<<\n\n');
    }
};