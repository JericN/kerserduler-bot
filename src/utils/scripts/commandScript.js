function generateCommandScript(command, commandOptions, userOptions) {
    const options = {};
    // Convert user options values to original choice names
    for (const name in userOptions) {
        const option = commandOptions.find((opt) => opt.name === name);
        if (!option) throw new Error(`Invalid option: ${name}`);
        const selected = option.choices.find((choice) => choice.value === userOptions[name]);
        if (!selected) throw new Error(`Invalid choice: ${userOptions[name]}`);
        options[name] = selected.name;
    }

    // Generate the command script
    const optionScript = commandOptions.map((opt) => `[${opt.name}] ${options[opt.name]}`);
    const script = `[Command] ${command} : ${optionScript.join(', ')}`;

    // Return the formatted script
    return '```' + script + '```';
}

module.exports = generateCommandScript;
