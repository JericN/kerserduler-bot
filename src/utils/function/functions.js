

// DATE FUNCTIONS
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



// CALENDAR FUNCTIONS
function objectToList(object) {
    array = new Array();
    Object.values(object).forEach((events) => {
        array.push(...events);
    });
    return array;
}

function sortEventsByDate(events) {
    events.sort((a, b) => {
        return new Date(a['start']['date']) - new Date(b['start']['date']);
    });
}

function makeEventListScript(events, res = '') {
    const makeScript = (event) => {
        let eventDate = formatDate(new Date(event['start']['date']));
        eventDate = eventDate.concat(' '.repeat(6 - eventDate.length));
        return (`${eventDate} - ${event.summary} \n`);
    };

    events.forEach((event) => {
        res = res.concat(makeScript(event));
    });
    return res;
}

module.exports = { addDaysToDate, formatDate, getFirstDayOfWeek, objectToList, sortEventsByDate, makeEventListScript };