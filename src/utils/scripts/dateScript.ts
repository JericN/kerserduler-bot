function format(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function generateDateScript({ start, end }: { start: Date; end: Date }) {
    // Format the start and end dates
    const startDate = format(start);
    const endDate = format(end);

    // Generate the script
    const script = `Searching events from [${startDate}] to [${endDate}]`;

    // Return the formatted script
    return '```' + script + '```';
}
