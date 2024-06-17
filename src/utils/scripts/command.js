// sorry for the bad code
function generateCommandScript(command, userOptions, commandOptions) {
    const options = {};
    // Convert user options values to original choice names
    for (const name in userOptions) {
        // Find the client command option
        const option = commandOptions.find((opt) => opt.name === name);
        if (!option) throw new Error(`Invalid option: ${name}`);

        // Assign the option value
        if (option.name === 'subjects') {
            if (userOptions[name].length) options[name] = userOptions[name].join(' ');
        } else {
            const selected = option.choices.find((choice) => choice.value === userOptions[name]);
            if (!selected) throw new Error(`Invalid choice: ${userOptions[name]}`);
            options[name] = selected.name;
        }
    }

    // Generate the command script
    let optionScript = Object.entries(options)
        .map(([name, value]) => `[${name}] ${value}`)
        .join(', ');
    if (optionScript.length === 0) optionScript = 'None';
    const script = `[Command] ${command} : ${optionScript}`;

    // Return the formatted script
    return '```' + script + '```';
}

module.exports = generateCommandScript;
