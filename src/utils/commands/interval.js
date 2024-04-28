const { getSunday, addDaysToDate } = require('../functions');

function calculateSearchSpan(span, align) {
    const start = align == 'sunday' ? getSunday() : new Date();
    start.setHours(0, 0, 0, 0);
    const end = addDaysToDate(start, span * 7 - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

module.exports = calculateSearchSpan;
