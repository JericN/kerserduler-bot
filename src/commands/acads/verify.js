const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');
const { getCalendarEvents, separateEvents } = require('../../utils/googleFunctions.js');
const { addDaysToDate, formatDate, getFirstDayOfWeek, objectToList, makeEventListScript } = require('../../utils/generalFunctions.js');

const listOfSubjects = fs.readFileSync(path.join(__dirname, '../../data/subjects.txt'), 'utf-8').split(/\r?\n/);
const messageScript = fs.readFileSync(path.join(__dirname, '../../data/scripts/event_message.txt'), 'utf-8');

module.exports = {
	deleted: true,
	name: 'verify',
	description: 'verify events to be sent',
	options: [
		{
			name: 'span',
			description: 'Search span',
			type: ApplicationCommandOptionType.Number,
			required: true,
			choices: [
				{ name: '1 week', value: 1 },
				{ name: '2 weeks', value: 2 },
				{ name: '3 weeks', value: 3 },
				{ name: '4 weeks', value: 4 },
			],
		},
		{
			name: 'align',
			description: 'Start with with first day of the week (sunday). [ default : yes ]',
			type: ApplicationCommandOptionType.String,
			required: false,
			choices: [
				{ name: 'yes', value: 'yes' },
				{ name: 'no', value: 'no' },
			],
			default: 'yes',
		},
	],
	allowedServerOnly: true,

	callback: async (client, interaction) => {
		await interaction.deferReply();

		const script = new Object({
			missingChannels: [],
		});

		// get command options
		const opt = getOptionValues(interaction.options);

		// set search span
		const dates = getSearchDates(opt.span, opt.align);

		// Get list of desired events from google calendar
		try {
			var calendarEvents = await getCalendarEvents(dates.start, dates.end);
		} catch (error) {
			console.log(`[ERROR] Calendar Fetch Request Failed`);
			interaction.editReply(`[ERROR] Calendar Fetch Request Failed`);
			return;
		}

		// separate valid and invalid events
		const { validEvents, invalidEvents } = await separateEvents(calendarEvents);

		// get corresponding subject channels and check for missing channels
		let missingChannels = checkMissingChannels(Object.keys(validEvents), interaction.guild.channels);

		// get guild roles and check for missing roles
		let missingRoles = checkMissingRoles(Object.keys(validEvents), interaction.guild.roles);

		makeScript(opt, dates, validEvents, invalidEvents, missingChannels, missingRoles);
	},
};

function getOptionValues(options) {
	const optionValues = new Object();
	module.exports.options.forEach((option) => {
		optionValues[option.name] = options.get(option.name)?.value || option.default;
	});

	optionValues.subjects = optionValues.subjects?.split(' ') || [];
	return optionValues;
}

function getSearchDates(span, align) {
	const start = align == 'yes' ? getFirstDayOfWeek() : new Date();
	const end = addDaysToDate(start, span * 7 - 1);
	return { start, end };
}

function checkMissingChannels(subjects, channels) {
	return subjects.filter((subject) => !channels.cache.some((ch) => ch.type === 0 && ch.name.replace(/[\s_-]/g, '') == subject));
}

function checkMissingRoles(subjects, roles) {
	return subjects.filter((subject) => !roles.cache.some((role) => role.name.replace(/[\s_-]/g, '') === subject));
}

function makeScript(opt, dates, validEvents, invalidEvents, missingChannels, missingRoles) {
	const commandScript = `Command: verify [span] ${opt.span} week(s), [align] ${opt.align}}`;

	const date = `[Verifying Events from ${formatDate(dates.start)} to ${formatDate(dates.end)}]\n\n`;
}

// ===================================================================================================

// function old(data, script) {
// 	const command = '```' + `Command: reqs [span] ${data.span} week(s), [align] ${data.align}, [supress] ${data.supress}}` + '```';

// 	if (script.eventWarning.length != 0)
// 		script.eventWarning = `[WARNING${data.supress ? ' @Supress' : ''}] Unrecognized Events:\n` + script.eventWarning + '\n';
// 	if (script.channelWarning.length != 0)
// 		script.channelWarning = `[WARNING${data.supress ? ' @Supress' : ''}] Missing Channels:\n` + script.channelWarning + '\n';
// 	if (script.roleWarning.length != 0) script.roleWarning = `[WARNING${data.supress ? ' @Supress' : ''}] Missing Roles:\n` + script.roleWarning + '\n';

// 	let warnings = script.errorWarning + script.eventWarning + script.channelWarning + script.roleWarning;
// 	if (warnings.length != 0) warnings = '```' + warnings + '```';

// 	const date = `[Events from ${formatDate(data.startDate)} to ${formatDate(data.endDate)}]\n\n`;

// 	let logs = script.okkeScript + script.nonoScript;
// 	if (logs.length != 0) logs = '```' + date + logs + '```';

// 	const consoleScript = command + warnings + logs;

// 	return consoleScript;
// }
// 1