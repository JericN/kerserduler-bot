const subjectMatch = null;

const subject = subjectMatch?.[0]?.replace(/[^a-z0-9]/gi, '').toLowerCase();
console.log(subject);
