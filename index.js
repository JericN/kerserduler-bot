const { Client, Events, GatewayIntentBits } = require('discord.js')
require('dotenv/config')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions
	],
	partials: [
		'MESSAGE',
		'CHANNEL',
		'REACTION'
	],
})

// initialize command path
require('./functions/set_commands.js')(client)

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
	client.channels.cache.get('1047046558702653440').send("I'm ready!")
})


client.on('messageCreate', (message) => {
	const prefix = '-'
	if (!message.content.startsWith(prefix) || message.author.bot) return
	const msg = message.content.slice(prefix.length).split(/ +/)
	const cmd = msg.shift().toLowerCase()
	const args = msg.toString()
	const command = client.commands.get(cmd)
	const channel = message.channel
	if (command) command.execute(client, message)
})


client.on('messageReactionAdd', (reaction, user) => {
	console.log("hello")
	reaction.message.channel.send("reacted")
})


client.login(process.env.TOKEN)







