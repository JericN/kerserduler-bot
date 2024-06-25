function formatSubject(subjects) {
    if (!subjects) return [];
    return subjects.split(' ').map((s) => s.toLowerCase());
}

export function extractUserOptions(interaction, options) {
    const optionValues = {};
    const input = interaction.options;

    // Iterate through the options and extract values
    for (const option of options) {
        // Get the value from input or use the default
        const value = input.get(option.name)?.value || option.default;

        // Format the option specific values
        if (option.name === 'subjects') {
            optionValues['subjects'] = formatSubject(value);
        } else {
            optionValues[option.name] = value;
        }
    }

    return optionValues;
}
