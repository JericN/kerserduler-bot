const fs = require('fs');
const path = require('path');
const subjectList = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/)
    .filter((subject) => subject.length > 0);

function validateInputSubjects(subjects) {
    return subjects.filter((subject) => !subjectList.includes(subject));
}

module.exports = validateInputSubjects;
