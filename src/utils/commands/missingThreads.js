function findMissingThreads(threads, listOfSubjects) {
    const listOfThreads = Object.keys(threads);
    const missingThreads = [];

    for (const subject of listOfSubjects) {
        if (!listOfThreads.includes(subject)) {
            missingThreads.push(subject);
        }
    }

    return missingThreads;
}

module.exports = findMissingThreads;
