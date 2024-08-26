import { DiscordEvent, EventLog } from '../schema';
import { assert } from '../assert';
import fs from 'fs';
import path from 'path';
// import readline from 'readline';

async function appendLinesToFile(filePath: string, lines: string[]): Promise<void> {
    try {
        if (!fs.existsSync(filePath)) await fs.promises.writeFile(filePath, '', 'utf8');
        const data = lines.join('\n') + '\n';
        await fs.promises.appendFile(filePath, data, 'utf8');
    } catch (error) {
        assert(error instanceof Error, 'Error should be an instance of Error');
        // eslint-disable-next-line no-console
        console.error(`Error appending lines to file: ${error.message}`);
        throw error;
    }
}

function formatDiscordEvent(event: DiscordEvent, timestamp: Date): string[] {
    const { events, messageId, threadId, guildId } = event;
    const eventLogs = events.map((event) => {
        const { calendarId, subject, summary } = event;
        return { timestamp, subject, summary, calendarId, messageId, threadId, guildId };
    }) as EventLog[];

    return eventLogs.map((event) => JSON.stringify(event));
}

export async function saveSendLogs(successfulEvents: DiscordEvent[]) {
    const timestamp = new Date();
    const logs: string[][] = successfulEvents.map((event) => formatDiscordEvent(event, timestamp));
    const logFilePath = path.join(__dirname, '../../data/sendLogs.txt');
    await appendLinesToFile(logFilePath, logs.flat());
    await appendLinesToFile(logFilePath, ['[ batch dispatch ]']);
}
