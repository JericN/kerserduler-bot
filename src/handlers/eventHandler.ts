import path from 'path';
import { assert } from '../utils/assert';
import { type Client } from 'discord.js';
import { getDirectoryContent } from '../utils/discord';

export default function eventHandler(client: Client) {
    const eventFolders = getDirectoryContent(path.join(__dirname, '..', 'events'), true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getDirectoryContent(eventFolder);
        eventFiles.sort((a, b) => a.localeCompare(b));

        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
        assert(typeof eventName !== 'undefined', 'Event name is undefined');

        client.on(eventName, async (args) => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(path.resolve(eventFile));
                await eventFunction(client, args);
            }
        });
    }
}
