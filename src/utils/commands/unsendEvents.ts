import { Client, ThreadChannel } from 'discord.js';
import { EventHistory } from '../schema';

export function unsendEvents(client: Client, messageHistory: EventHistory[]) {
    messageHistory.forEach((batch) => {
        batch.messages.forEach(async ({ threadId, messageId }) => {
            console.log('Deleting message', messageId, 'in thread', threadId);
            const thread = client.channels.cache.get(threadId) as ThreadChannel;
            if (!thread) return;

            try {
                const message = await thread.messages.fetch(messageId);
                console.log('Message', message);
                if (message) {
                    message.delete();
                }
            } catch (error) {
                console.error('Failed to delete message', messageId, 'in thread', threadId);
            }
        });
    });
}
