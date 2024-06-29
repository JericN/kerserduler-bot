// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { Client, IntentsBitField } from 'discord.js';
import eventHandler from './handlers/eventHandler';

// Create a new client instance with the intents we need
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// All event handling is done here
eventHandler(client);

client.login(process.env.DISCORD_TOKEN);
