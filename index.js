const { Client, Events, Collection, GatewayIntentBits } = require('discord.js')
const path = require('node:path')
const fs = require('node:fs')
require('dotenv/config')

const PREFIX = '-'

// Initialize Client
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

// Save commands to client.collection
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(path.join(commandsPath, file))
	if ('name' in command && 'code' in command && 'execute' in command) {
		client.commands.set(command.code, command)
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required property.`)
	}
}

// EVENT: Bot is online
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
})

// EVENT: Message is detected
client.on('messageCreate', (message) => {
	if (!message.content.startsWith(PREFIX) || message.author.bot) return
	const msg = message.content.slice(PREFIX.length).split(/ +/)
	const command = client.commands.get(msg.shift().toLowerCase())
	const args = msg.toString()
	if (command) command.execute(client, message)
})


client.on('messageReactionAdd', (reaction, user) => {

})


client.login(process.env.TOKEN)







