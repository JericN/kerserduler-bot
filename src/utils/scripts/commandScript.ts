export function generateCommandScript<T extends object>(commandName: string, userOptions: T): string {
    // Generate the command script
    let optionScript = Object.entries(userOptions)
        .map(([name, value]) => `[${name}] ${value.name}`)
        .join(', ');

    if (optionScript.length === 0) optionScript = 'None';
    const script = `[Command] ${commandName} : ${optionScript}`;

    // Return the formatted script
    return '```' + script + '```';
}
