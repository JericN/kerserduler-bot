export function formatDate(date: Date) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}
