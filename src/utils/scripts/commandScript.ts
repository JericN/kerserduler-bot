import { toCyan, wrap } from '../discordColor';

export function generateCommandScript<T extends object>(commandName: string, userOptions: T): string {
    // Generate the command script
    const optionScript = Object.entries(userOptions)
        .map(([name, value]) => `${name}: ${toCyan(value.name, 'u')}`)
        .join(', ');

    const script = `Command: ${toCyan(commandName, 'u')}, ${optionScript}`;

    // Return the formatted script
    return wrap(script);
}
