const { addDaysToDate } = require('../functions');

function getMonday() {
    const today = new Date();
    const firstDay = today.getDate() - today.getDay() + 1;
    return new Date(today.setDate(firstDay));
}

function calculateSearchSpan(span, align) {
    const start = align == 'monday' ? getMonday() : new Date();
    start.setHours(0, 0, 0, 0);
    const end = addDaysToDate(start, span * 7 - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

module.exports = calculateSearchSpan;
