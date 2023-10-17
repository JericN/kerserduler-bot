// DATE FUNCTIONS
function addDaysToDate(date, days) {
	var date = new Date(date);
	date.setDate(date.getDate() + days);
	return date;
}

function formatDate(date) {
	return date.toLocaleString('default', { month: 'short', day: 'numeric' });
}

// monday
function getFirstDayOfWeek() {
	const today = new Date();
	const firstDay = today.getDate() - today.getDay() + 1;
	return new Date(today.setDate(firstDay));
}

// CALENDAR FUNCTIONS
function objectToList(object) {
	return [].concat(...Object.values(object));
}

function sortEventsByDate(events) {
	events.sort((a, b) => {
		return new Date(a['start']['date']) - new Date(b['start']['date']);
	});
}

function makeEventListScript(events) {
	return events
		.map((event) => {
			const eventDate = formatDate(new Date(event.start.date));
			return `${eventDate.padEnd(6)} - ${event.summary}`;
		})
		.join('\n');
}

module.exports = { addDaysToDate, formatDate, getFirstDayOfWeek, objectToList, sortEventsByDate, makeEventListScript };
