export function findMissingRoles(roles, listOfSubjects) {
    const listOfRoles = Object.keys(roles);
    const missingRoles = [];

    for (const subject of listOfSubjects) {
        if (!listOfRoles.includes(subject)) {
            missingRoles.push(subject);
        }
    }

    return missingRoles;
}
