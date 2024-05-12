const fs = require('fs');
const path = require('path');
const list = fs.readFileSync(path.join(__dirname, '../../data/subjects.txt'), 'utf-8').split(/\r?\n/);

function validateInputSubjects(subjects) {
    return subjects.filter((subject) => !list.includes(subject));
}

module.exports = validateInputSubjects;
