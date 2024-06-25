import fs from 'fs';
import path from 'path';

export function getDirectoryContent(directory: string, foldersOnly = false): string[] {
    const fileNames: string[] = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (foldersOnly && file.isDirectory()) fileNames.push(filePath);
        else if (!foldersOnly && file.isFile()) fileNames.push(filePath);
    }

    return fileNames;
}
