import { AcadEvent, DiscordEvent } from '../types/types';
import { Role, ThreadChannel } from 'discord.js';
import { formatDate } from '../functions';
import fs from 'fs';
import path from 'path';

type EventRecord = Record<string, AcadEvent[]>;
type ThreadRecord = Record<string, ThreadChannel>;
type RoleRecord = Record<string, Role>;
type DateSpan = { start: Date; end: Date };

const messageScript = fs.readFileSync(
    path.join(__dirname, '..', '..', 'data', 'scripts', 'event_message.txt'),
    'utf-8',
);

export async function sendEventsToChannels(
    groupedEvents: EventRecord,
    dates: DateSpan,
    threads: ThreadRecord,
    roles: RoleRecord,
) {
    const successfulEvents: DiscordEvent[] = [];
    const failedEvents: DiscordEvent[] = [];

    for (const [subject, events] of Object.entries(groupedEvents)) {
        const reqsScript = events
            .map((reqs) => `📍 **${formatDate(new Date(reqs.startDate))}**  ${reqs.summary}`)
            .join('\n');

        const msg = messageScript
            .replace('[<start>]', formatDate(dates.start))
            .replace('[<end>]', formatDate(dates.end))
            .replace('[<role>]', `<@&${roles[subject].id}>`)
            .replaceAll('[<subject>]', subject.toUpperCase())
            .replace('[<requirements>]', reqsScript);

        let response;
        try {
            response = await threads[subject].send(msg);
            successfulEvents.push({
                events,
                text: msg,
                id: response.id,
                threadId: response.channel.id,
                guildId: response.guild.id,
            });
        } catch {
            failedEvents.push({ events, text: msg, id: '', threadId: '', guildId: '' });
        }
    }

    return { successfulEvents, failedEvents };
}
