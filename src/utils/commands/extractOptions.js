function formatSubject(subjects) {
    if (!subjects) return [];
    return subjects.split(' ').map((subject) => {
        if (/^\d+$/.test(subject)) {
            return `cs${subject}`;
        }
        return subject.toLowerCase();
    });
}

/**
 * Extracts command options and formats the 'subjects' option if present.
 * @param {Map} input - Input map containing option values.
 * @param {Object[]} options - Array of option objects.
 * @returns {Object} - Extracted and formatted option values.
 */
function extractUserOptions(interaction, options) {
    const optionValues = {};
    const input = interaction.options;

    // Iterate through the options and extract values
    options.forEach((option) => {
        // Get the value from input or use the default
        const value = input.get(option.name)?.value || option.default;

        // Format 'subjects' option if present
        if (option.name === 'subjects') {
            optionValues[option.name] = formatSubject(value);
        } else {
            optionValues[option.name] = value;
        }
    });

    return optionValues;
}

module.exports = extractUserOptions;
