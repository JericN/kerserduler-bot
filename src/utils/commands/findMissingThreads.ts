import { ThreadChannel } from 'discord.js';

export function findMissingThreads(threads: Record<string, ThreadChannel>, listOfSubjects: string[]) {
    const listOfThreads = Object.keys(threads);
    const missingThreads: string[] = [];

    for (const subject of listOfSubjects) {
        if (!listOfThreads.includes(subject)) {
            missingThreads.push(subject);
        }
    }

    return missingThreads;
}
