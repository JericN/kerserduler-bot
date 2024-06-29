import { toRed, wrap } from '../discordColor';

export function generateSendWarningScript(invalidEvents: string[], missingThreads: string[], missingRoles: string[]) {
    const script = {
        invalidEvents: '',
        missingThreads: '',
        missingRoles: '',
    };

    if (invalidEvents.length > 0) {
        script.invalidEvents = wrap(`${toRed('Invalid Events Found!', 'b')}\n- ${invalidEvents.join('\n- ')}`);
    }

    if (missingThreads.length > 0) {
        script.missingThreads = wrap(`${toRed('Missing Threads Found!', 'b')}\n- ${missingThreads.join('\n- ')}`);
    }

    if (missingRoles.length > 0) {
        script.missingRoles = wrap(`${toRed('Missing Roles Found!', 'b')}\n- ${missingRoles.join('\n- ')}`);
    }

    return script.invalidEvents + script.missingThreads + script.missingRoles;
}
