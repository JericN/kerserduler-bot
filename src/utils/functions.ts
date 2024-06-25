function objectToList(object) {
    return [].concat(...Object.values(object));
}

// DATE FUNCTIONS

function formatDate(date: Date): string {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}

export { objectToList, formatDate };
