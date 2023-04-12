const { getEvents } = require('../functions/calendarHandler.js');
const fs = require('fs');

const listOfSubjects = fs.readFileSync('./data/subjects.txt', 'utf-8').split('\n');

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

// Argument checking
const parseArguments = (args) => {
    const invalidInputs = new Array();

    // check if 'week' argument is present, set time span
    if (args.includes('week')) {
        var startDate = getFirstDayOfWeek(new Date());
        var endDate = new Date(new Date().setDate(startDate.getDate() + 8));
        args.splice(args.indexOf('week'), 1);
    } else {
        startDate = new Date();
        endDate = new Date(new Date().setDate(startDate.getDate() + 8));
    }

    // check for invalid arguments
    for (subj of args) {
        if (!listOfSubjects.includes(subj)) {
            invalidInputs.push(subj);
        }
    }

    // return corresponsing data
    if (invalidInputs.length == 0) {
        return {
            'targetSubjects': args,
            'startDate': startDate,
            'endDate': endDate
        };
    } else {
        throw invalidInputs.toString();
    }
};


// Get respective channel for each subject
const getChannels = (guild) => {
    let acadChannels = new Object();
    guild.channels.cache.forEach((channel) => {
        const name = channel.name.replaceAll(/[\s_-]/g, '');
        if (listOfSubjects.includes(name)) {
            acadChannels[name] = channel;
        }
    });
    return acadChannels;
};


// Send Events to their respective channels
const sendEvents = async (client, message, startDate, endDate, targetSubjects, acadChannels, validEvents) => {
    const script = fs.readFileSync('./data/script.txt', 'utf-8');
    let logs = new String().concat('#step\n');
    let counter = 0;

    for (let subject in validEvents) {

        // If specific subject is stated in args, check if included 
        if (targetSubjects.length != 0 && !targetSubjects.includes(subject)) continue;

        // Check if a channel exist for that subject
        const currChannel = acadChannels[subject];
        if (!currChannel) {
            delete validEvents[subject];
            console.log('[WARNING] No <' + subject + '> channel found!');
            message.channel.send('```css\n[WARNING] Channel for ' + subject + ' is not recognized\n```');
            continue;
        }

        // Collate all requirements
        let strLine = new String();
        validEvents[subject].forEach((reqs) => {
            strLine = strLine.concat('📍 **' + dateFormat(new Date(reqs['start']['date'])) + '**  ' + reqs['summary'] + '\n');
        });

        // Edit script
        const msg = script
            .replace('[<start>]', dateFormat(startDate))
            .replace('[<end>]', dateFormat(endDate))
            .replaceAll('[<subject>]', subject.toUpperCase())
            .replace('[<requirements>]', strLine);

        // Send message to its corresponding channel
        await currChannel.send(msg);
    }

    // Pause execution, give time for discord to load new message
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save new messages to the logs file
    for (subject in validEvents) {
        console.log('[LOGS] Message is sent to <' + subject + '> channel');
        message.channel.send('```\n[LOGS] Message is sent to ' + subject + ' channel\n```');
        counter = counter + 1;

        channel = await client.channels.fetch(acadChannels[subject].id);
        logs = logs
            .concat(subject + ' ')
            .concat(channel.id + ' ')
            .concat(channel.lastMessageId + '\n');
    }

    if (counter != 0) {
        fs.appendFileSync('./data/recent_message.txt', logs);
    }
    await message.channel.send('```css\n#Success Update sent in ' + counter + ' channel(s)\n```');
};





module.exports = {
    name: "Send Requirements",
    code: "reqs",
    desc: "",

    async execute(client, guild, message, args) {
        args = args.split(',').filter(Boolean);

        // Parse input argument
        try {
            var { targetSubjects, startDate, endDate } = parseArguments(args);
            console.log('Searching date: ' + dateFormat(startDate) + ' to ' + dateFormat(endDate));
            await message.channel.send('```diff\n!Searching Span: ' + dateFormat(startDate) + ' to ' + dateFormat(endDate) + '\n```');
        } catch (invalidInputs) {
            console.log('[ERROR] Invalid input subject: ' + invalidInputs);
            await message.channel.send('```css\n[ERROR] Invalid subject: ' + invalidInputs + '\n```');
            await message.react('❎');
            return;
        }

        // Get list of subject channel
        const acadChannels = getChannels(guild);

        // Get list of events from google calendar
        try {
            var { validEvents, invalidEvents } = await getEvents(targetSubjects, startDate, endDate);
        } catch (error) {
            console.log(error);
            console.log('[ERROR] Unsuccessful Google Calendar Authentication');
            await message.channel.send('```css\n[ERROR] Unsuccessful Google Calendar Authentication\n```');
            await message.react('❎');
            return;
        }

        // Dont show warning logs if on selective search
        if (targetSubjects.length == 0) {
            for (req of invalidEvents) {
                console.log('[WARNING] Calendar Event <' + req + '> is not recognized');
                message.channel.send('```css\n[WARNING] Calendar Event ' + req + ' is not recognized\n```');
            }
        }
        // Find the correct channel for each subject and send the message
        await sendEvents(client, message, startDate, endDate, targetSubjects, acadChannels, validEvents);
        message.react('✅');
        console.log('>>>>>>>>>>>>>>>>>> DONE <<<<<<<<<<<<<<<<<<<\n\n');
    }
};
