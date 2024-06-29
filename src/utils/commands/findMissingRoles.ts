import { Role } from 'discord.js';

export function findMissingRoles(roles: Record<string, Role>, listOfSubjects: string[]) {
    const listOfRoles = Object.keys(roles);
    const missingRoles: string[] = [];

    for (const subject of listOfSubjects) {
        if (!listOfRoles.includes(subject)) {
            missingRoles.push(subject);
        }
    }

    return missingRoles;
}
