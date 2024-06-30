import { toRed, wrap } from '../discordColor';

export function generateSendWarningScript(invalidEvents: string[], missingThreads: string[], missingRoles: string[]) {
    const script = {
        invalidEvents: '',
        missingThreads: '',
        missingRoles: '',
    };

    if (invalidEvents.length > 0) {
        const title = toRed('Invalid Events Found!', 'b');
        script.invalidEvents = wrap(`${title}\n- ${invalidEvents.join('\n- ')}`);
    }

    if (missingThreads.length > 0) {
        const title = toRed('Missing Threads Found!', 'b');
        script.missingThreads = wrap(`${title}\n- ${missingThreads.join('\n- ')}`);
    }

    if (missingRoles.length > 0) {
        const title = toRed('Missing Roles Found!', 'b');
        script.missingRoles = wrap(`${title}\n- ${missingRoles.join('\n- ')}`);
    }

    return script.invalidEvents + script.missingThreads + script.missingRoles;
}
