import path from 'path';
import { LocalCommand } from '../types/types';
import { getDirectoryContent } from './index';

export function getLocalCommands(exceptions = [] as string[]): LocalCommand[] {
    const localCommands: LocalCommand[] = [];

    const commandCategories = getDirectoryContent(path.join(__dirname, '..', '..', 'commands'), true);

    for (const commandCategory of commandCategories) {
        const commandFiles = getDirectoryContent(commandCategory);

        for (const commandFile of commandFiles) {
            if (exceptions.includes(commandFile)) continue;

            const commandFunction = LocalCommand.parse(require(commandFile));
            localCommands.push(commandFunction);
        }
    }
    return localCommands;
}
