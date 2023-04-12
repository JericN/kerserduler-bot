
const fs = require('fs');
const path = require('path');
const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const getCalendarEvents = require('../../utils/google/getCalendarEvents.js');

const listOfSubjects = fs.readFileSync(path.join(__dirname, '../../data/subjects.txt'), 'utf-8').split(/\r?\n/);
const messageScript = fs.readFileSync(path.join(__dirname, '../../data/script.txt'), 'utf-8');

// Format date to <month> <day>
function dateFormat(date) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' });
}

function getFirstDayOfWeek() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day;

    return new Date(date.setDate(diff));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}





module.exports = {
    /**
     * @param {Client} client
     * @param {Interaction} interaction
     */

    name: "reqs",
    description: "send list of requirements to their respective channels",
    deleted: false,
    options: [
        {
            name: 'span',
            description: 'Query search span',
            type: ApplicationCommandOptionType.Number,
            required: true,
            choices: [
                {
                    name: '1 week',
                    value: 1
                },
                {
                    name: '2 weeks',
                    value: 2
                },
                {
                    name: '3 weeks',
                    value: 3
                },
                {
                    name: '4 weeks',
                    value: 4
                },
            ]
        },
        {
            name: 'align',
            description: 'Align to first day of the week (sunday)',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'yes',
                    value: 'yes'
                },
                {
                    name: 'no',
                    value: 'no'
                },
            ]
        },
        {
            name: 'subjects',
            description: 'Subject(s) to query ex."21 33 132"',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'supress',
            description: 'Force send valid events to channels while ignoring invalid subjects',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'yes',
                    value: 'yes'
                },
                {
                    name: 'no',
                    value: 'no'
                },
            ]
        }
    ],
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        // get query values
        const duration = interaction.options.get('span').value;
        const align = interaction.options.get('align').value;
        const subjects = interaction.options.get('subjects')?.value.split(' ') || [];
        const supress = interaction.options.get('supress')?.value || 'no';

        // set search span
        const startDate = (align == 'yes') ? getFirstDayOfWeek() : new Date();
        const endDate = new Date(new Date().setDate(startDate.getDate() + duration * 7 - 1));

        // Parse subjects
        const invalidSubjects = new Array();
        subjects.forEach((subject, i) => {
            subjects[i] = subject = 'cs' + subject;
            if (!listOfSubjects.includes(subject))
                invalidSubjects.push(subject);
        });

        // check invalid subject input
        if (invalidSubjects.length != 0) {
            interaction.editReply(`\`\`\`[ERROR] Invalid subject(s): ${invalidSubjects.toString()} \`\`\``);
            return;
        }

        // Get list of events from google calendar
        try {
            var { validEvents, invalidEvents } = await getCalendarEvents(startDate, endDate);
        } catch (error) {
            interaction.editReply('```[ERROR] Unsuccessful Google Calendar Authentication```');
            return;
        }

        if (!subjects.length) {
            for (const event of invalidEvents) {
                interaction.editReply(`\`\`\`[WARNING] Calendar Event < ${event['summary']} > is not recognize\`\`\``);
                if (supress == 'no') {
                    return;
                }
            }
        }

        // Find the correct channel for each subject and send the message
        await sendEvents(client, interaction, startDate, endDate, subjects, validEvents);
    }
};


// Send Events to their respective channels
const sendEvents = async (client, interaction, startDate, endDate, subjects, validEvents) => {

    // let logs = new String().concat('#step\n');
    let counter = 0;

    // get subject channels
    let channels = new Object();
    interaction.guild.channels.cache.forEach((channel) => {
        // check if not text channel
        if (channel.type != '0') return;

        const name = channel.name.replaceAll(/[\s_-]/g, '');
        console.log(name);
        if (listOfSubjects.includes(name)) {
            channels[name] = channel;
        }
    });
    console.log(channels);

    //     for (let event in validEvents) {
    //         const channel = channels[event];
    //         if (!channel) {
    //             delete validEvents[event];
    //             console.log(`[WARNING] No < ${event} > channel found!`);
    //         }
    //     }


    //     for (let event in validEvents) {

    //         // If specific subject is stated in args, check if included
    //         // if (subjects && !subjects.includes(event)) continue;



    //         // Check if a channel exist for that subject
    //         const channel = channels[event];


    //         // Collate all requirements
    //         let eventScript = new String();
    //         validEvents[event].forEach((reqs) => {
    //             eventScript = eventScript.concat('📍 **' + dateFormat(new Date(reqs['start']['date'])) + '**  ' + reqs['summary'] + '\n');
    //         });

    //         // Edit script
    //         const msg = script
    //             .replace('[<start>]', dateFormat(startDate))
    //             .replace('[<end>]', dateFormat(endDate))
    //             .replaceAll('[<subject>]', subject.toUpperCase())
    //             .replace('[<requirements>]', eventScript);

    //         // Send message to its corresponding channel
    //         await currChannel.send(msg);
    //     }

    //     // Pause execution, give time for discord to load new message
    //     await new Promise(resolve => setTimeout(resolve, 2000));

    //     // Save new messages to the logs file
    //     for (subject in validEvents) {
    //         console.log('[LOGS] Message is sent to <' + subject + '> channel');
    //         message.channel.send('```\n[LOGS] Message is sent to ' + subject + ' channel\n```');
    //         counter = counter + 1;

    //         channel = await client.channels.fetch(acadChannels[subject].id);
    //         logs = logs
    //             .concat(subject + ' ')
    //             .concat(channel.id + ' ')
    //             .concat(channel.lastMessageId + '\n');
    //     }

    //     if (counter != 0) {
    //         fs.appendFileSync('./data/recent_message.txt', logs);
    //     }
    //     await message.channel.send('```css\n#Success Update sent in ' + counter + ' channel(s) \n```');
};