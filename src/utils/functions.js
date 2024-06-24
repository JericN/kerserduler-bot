function objectToList(object) {
    return [].concat(...Object.values(object));
}

// DATE FUNCTIONS
function addDaysToDate(date, days) {
    const newdate = new Date(date);
    newdate.setDate(date.getDate() + days);
    return newdate;
}

function formatDate(date) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}

module.exports = { objectToList, addDaysToDate, formatDate };
