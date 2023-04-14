require('dotenv/config');
const fs = require('fs');
const path = require('path');

const { google } = require('googleapis');
const { ApplicationCommandOptionType } = require('discord.js');



const deleteMessages = async (client, events) => {
    const logs = new Object({ 'okke': [], 'nono': [] });
    for (const event of events) {
        const [subject, channelId, messageId] = event.split(' ');
        console.log(subject, channelId, messageId);
        const channel = client.channels.cache.get(channelId);
        try {
            const message = await channel.messages.fetch(messageId);
            await message.delete();
            logs['okke'].push(subject);
            console.log(`[LOGS] Message in <${subject}> channel is deleted`);
        } catch (error) {
            logs['nono'].push(subject);
            console.log(`[WARNING] Message in <${subject}> is not found`);
        }
    }

    return logs;
};

module.exports = {
    deleted: false,
    name: 'undo',
    description: 'Unsend recent update from channels',
    options: [
        {
            name: 'subjects',
            description: 'Subject(s) to query ex."21 33 132"',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        let hist = fs.readFileSync(path.join(__dirname, '../../data/history/922844835931643967.txt'), 'utf-8').split('[x]');
        lastEvents = hist.pop();

        console.log(lastEvents);
        if (!lastEvents.length) {
            console.log('[ERROR] Recent logs are empty');
            await interaction.reply('```[ERROR] Recent logs are empty```');
            return;
        }

        const events = lastEvents.split('\n').filter(e => e.length);
        const date = new Date(events.shift());
        const logs = await deleteMessages(client, events);

        let script = `[Deleting recent update: ${date.toLocaleString("en-US")}]\n`;
        if (logs['okke'].length != 0) {
            logs['okke'].forEach((log) => {
                script += log.replace('cs', '[DELETED] CS ') + '\n';
            });
        }
        await interaction.reply('```' + script + '```');
        const newHist = hist.join('[x]');

        fs.writeFileSync(path.join(__dirname, '../../data/history/922844835931643967.txt'), newHist);
    }
};


function formatDate(date) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}
