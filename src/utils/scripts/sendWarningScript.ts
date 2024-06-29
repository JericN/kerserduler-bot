function wrap(text: string) {
    return '```asciidoc\n' + text + '\n```';
}

export function generateSendWarningScript(invalidEvents: string[], missingThreads: string[], missingRoles: string[]) {
    const script = {
        invalidEvents: '',
        missingThreads: '',
        missingRoles: '',
    };
    if (invalidEvents.length > 0) {
        script.invalidEvents = wrap(`[ Invalid Events Found ]\n${invalidEvents.join('\n')}`);
    }
    if (missingThreads.length > 0) {
        script.missingThreads = wrap(`[ Missing Threads Found ]\n${missingThreads.join('\n')}`);
    }
    if (missingRoles.length > 0) {
        script.missingRoles = wrap(`[ Missing Roles Found ]\n${missingRoles.join('\n')}`);
    }

    return script.invalidEvents + script.missingThreads + script.missingRoles;
}
