function wrap(text: string) {
    return '```ansi\n' + text + '\n```';
}

function bold(text: string): string {
    return `[1m${text}[0m`;
}

function underline(text: string): string {
    return `[4m${text}[0m`;
}

function formatFont(text: string, format: string = ''): string {
    text = format.includes('u') ? underline(text) : text;
    text = format.includes('b') ? bold(text) : text;
    return text;
}

function toCyan(text: string, format = ''): string {
    return `[2;36m${formatFont(text, format)}[0m`;
}

function toBlue(text: string, format = ''): string {
    return `[2;34m${formatFont(text, format)}[0m`;
}

function toRed(text: string, format = ''): string {
    return `[2;31m${formatFont(text, format)}[0m`;
}

export { wrap, bold, underline, formatFont, toCyan, toBlue, toRed };
