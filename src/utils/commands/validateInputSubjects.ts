import fs from 'fs';
import path from 'path';

const subjectList = fs
    .readFileSync(path.join(__dirname, '..', '..', 'data', 'subjects.txt'), 'utf-8')
    .split(/\r?\n/)
    .filter((subject) => subject.length > 0);

export function validateInputSubjects(subjects: string[]) {
    return subjects.filter((subject) => !subjectList.includes(subject));
}
