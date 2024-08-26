import fs from 'fs';
import path from 'path';

import { EventHistory, EventLog } from '../schema';

export function getMessageHistory(steps: number = 1): EventHistory[] {
    const logsPath = path.join(__dirname, '..', '..', 'data', 'sendLogs.txt');

    if (!fs.existsSync(logsPath)) {
        fs.closeSync(fs.openSync(logsPath, 'w'));
    }
    const logs = fs.readFileSync(logsPath, 'utf8');

    const batches = logs.split('[ batch dispatch ]').slice(-steps);
    const messageHistory = batches.map((batch) => batch.split('\n').filter((line) => line.length > 0));
    const messageHistoryObject = messageHistory.map((batch) => batch.map((line) => JSON.parse(line)));

    return messageHistoryObject.map((batch) => ({
        timestamp: new Date(batch[0].timestamp),
        messages: batch.map((line) => EventLog.parse(line)),
    }));
}
