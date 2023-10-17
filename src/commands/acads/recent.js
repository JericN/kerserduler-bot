require('dotenv/config');
const fs = require('fs');
const path = require('path');

const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
	deleted: false,
	name: 'recent',
	description: 'get recent updates from channels',
	options: [
		{
			name: 'action',
			description: 'Show or delete recent updates',
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{ name: 'preview', value: 'preview' },
				{ name: 'unsend', value: 'unsend' },
			],
		},
	],
	allowedServerOnly: true,

	callback: async (client, interaction) => {
		const filePath = `../../data/history/${interaction.guildId}.txt`;
		try {
			var hist = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
		} catch (err) {
			fs.closeSync(fs.openSync(path.join(__dirname, filePath), 'w'));
			hist = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
		}
		hist = hist.split('[x]');

		const optPreview = interaction.options.get('action')?.value;
		lastEvents = hist.pop();
		await interaction.deferReply();

		console.log(lastEvents);
		if (!lastEvents.length) {
			console.log('[ERROR] Recent logs are empty');
			await interaction.editReply('```[ERROR] Recent logs are empty```');
			return;
		}

		const events = lastEvents.split('\n').filter((e) => e.length);
		const date = new Date(events.shift());

		if (optPreview == 'preview') {
			let script = `[Recent updates: ${date.toLocaleString('en-US')}]\n`;
			for (const event of events) {
				const subject = event.split(' ').shift();
				script += subject.replace('cs', 'CS ') + '\n';
			}
			await interaction.editReply('```' + script + '```');
			return;
		}

		const logs = await deleteMessages(client, events);

		let script = `[Deleting recent update: ${date.toLocaleString('en-US')}]\n`;
		if (logs['okke'].length != 0 || logs['nono'].length != 0) {
			logs['okke'].forEach((log) => {
				script += log.replace('cs', '[DELETED] CS ') + '\n';
			});
			logs['nono'].forEach((log) => {
				script += log.replace('cs', '[FAILED] CS ') + '\n';
			});
		}

		await interaction.editReply('```' + script + '```');
		const newHist = hist.join('[x]');

		try {
			fs.writeFileSync(path.join(__dirname, `../../data/history/${interaction.guildId}.txt`), newHist);
		} catch (error) {
			console.log('[ERROR] Failed to update logs');
			await interaction.followUp('[ERROR] Failed to update logs');
		}
	},
};

const deleteMessages = async (client, events) => {
	const logs = new Object({ okke: [], nono: [] });
	for (const event of events) {
		const [subject, channelId, messageId] = event.split(' ');
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

function formatDate(date) {
	return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}
