require('dotenv/config');
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const { addDaysToDate, getFirstDayOfWeek } = require('./src/utils/generalFunctions.js');
const { getCalendarEvents, separateEvents } = require('./src/utils/googleFunctions.js');
const { people } = require('googleapis/build/src/apis/people/index.js');
const listOfSubjects = fs.readFileSync(path.join(__dirname, 'src', 'data', 'subjects.txt'), 'utf-8').split(/\r?\n/);

function tester(flag) {
	flag.force = true;
	flag.subjects = ['21', '33', '132'];
}

function test() {
	const flag = {
		span: 1,
		align: true,
		subjects: null,
		force: false,
	};

	console.log(flag);
	tester(flag);
	console.log(flag);
}
test();
