const fs = require('fs');
const path = require('path');

function getAllFiles(directory, foldersOnly) {
    const fileNames = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (foldersOnly && file.isDirectory()) fileNames.push(filePath);
        else if (!foldersOnly && file.isFile()) fileNames.push(filePath);
    }

    return fileNames;
}

module.exports = getAllFiles;
