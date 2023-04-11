
require('dotenv').config();
const { clientID, testServer } = require('./config.json');
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.TOKEN);

// ...

// for guild-based commands
rest.put(Routes.applicationGuildCommands(clientID, testServer), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(clientID), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);