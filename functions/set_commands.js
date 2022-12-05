const { Collection } = require('discord.js')
const path = require('node:path')
const fs = require('node:fs')

module.exports = (client) => {
    client.commands = new Collection()
    const commandsPath = path.join(__dirname, '..', 'commands')
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file))
        if ('name' in command && 'code' in command && 'execute' in command) {
            client.commands.set(command.code, command)
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required property.`)
        }
    }
}


