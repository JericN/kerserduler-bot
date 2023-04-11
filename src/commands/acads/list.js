// get list of events from google calendar

const { Interaction, ApplicationCommandOptionType } = require('discord.js');
const getCalendarEvents = require('../../utils/google/getCalendarEvents.js');

module.exports = {
    /**
     * @param {Interaction} interaction
     */

    name: 'list',
    description: 'get list of events',
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
        }
    ],


    callback: async (client, interaction) => {
        await interaction.deferReply();

        // get query values
        const duration = interaction.options.get('span').value;
        const align = interaction.options.get('align')?.value || 'Yes';

        // set search span
        const startDate = (align == 'yes') ? getFirstDayOfWeek() : new Date();
        const endDate = new Date(new Date().setDate(startDate.getDate() + duration * 7 - 1));

        // get calendar events
        try {
            var calendarEvents = await getCalendarEvents(startDate, endDate);
        } catch (error) {
            console.log(error);
            console.log('⚠ Unsuccessful Google Calendar Authentication');
            return;
        }

        // create message
        let script = new String().concat('```').concat(`md\n#[ Events from ${formatDate(startDate)} to ${formatDate(endDate)} ]\n`);
        for (const req of calendarEvents) {
            let eventDate = formatDate(new Date(req['start']['date']));
            eventDate = eventDate.concat(' '.repeat(6 - eventDate.length));
            script = script.concat(`${eventDate} - ${req.summary} \n`);
        }
        script = script.concat('\n```');;;

        // send message
        await interaction.editReply(script);
    }
};


function formatDate(date) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}

function getFirstDayOfWeek() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
}
