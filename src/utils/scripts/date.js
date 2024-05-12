function format(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateDateScript({ start, end }) {
    // Format the start and end dates
    const startDate = format(start);
    const endDate = format(end);

    // Generate the script
    const script = `Searching events from [${startDate}] to [${endDate}]`;

    // Return the formatted script
    return '```' + script + '```';
}

module.exports = generateDateScript;
