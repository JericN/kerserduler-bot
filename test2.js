const fs = require('fs')
const contents = fs.readFileSync('subjects.txt', 'utf-8')
const arr = contents.split('\n')
for (subject of arr) {
    console.log(subject)
}