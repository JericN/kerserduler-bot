import { toCyan, wrap } from '../discordColor';
import { formatDate } from '../textFormat';

export function generateDateScript({ start, end }: { start: Date; end: Date }) {
    // Format the start and end dates
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // Generate the script
    const script = `Searching events from ${toCyan(startDate, 'b')} to ${toCyan(endDate, 'b')}.`;

    // Return the formatted script
    return wrap(script);
}
