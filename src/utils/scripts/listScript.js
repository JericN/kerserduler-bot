const fs = require('fs');
const path = require('path');
const { formatDate } = require('../functions');

const warningPath = path.join(__dirname, '../../data/scripts/list_template.txt');

function generateListCommandScript(options, dates, validScript, invalidScript) {
    let warningScript = fs.readFileSync(warningPath, 'utf-8');

    warningScript = warningScript
        .replace('[<span>]', options.span)
        .replace('[<start>]', options.start)
        .replace('[<group>]', options.group)
        .replace('[<startDate>]', formatDate(dates.start))
        .replace('[<endDate>]', formatDate(dates.end))
        .replace('[<validEvents>]', validScript);

    if (invalidScript.length != 0) {
        invalidScript = '[ Unrecognized Events Found ]\n' + invalidScript;
    }
    warningScript = warningScript.replace('[<invalidEvents>]', invalidScript);

    return warningScript;
}

module.exports = generateListCommandScript;
