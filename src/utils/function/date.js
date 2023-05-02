

function addDaysToDate(date, days) {
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    return date;
};

function formatDate(date) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
};

function getFirstDayOfWeek() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + 1;
    return new Date(date.setDate(diff));
}

module.exports = { addDaysToDate, formatDate, getFirstDayOfWeek };