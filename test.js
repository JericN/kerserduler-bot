const fs = require('fs')
const { google } = require('googleapis')

const GOOGLE_API_FOLDER_ID = '1hhtiQeE5DCMZICkecC4m73pSynWWwTX-'



const auth = new google.auth.GoogleAuth({
    keyFile: './googlekey.json',
    scopes: ['https://www.googleapis.com/auth/drive']
})

const driveService = google.drive({
    version: 'v3',
    auth
})


async function uploadFile() {
    try {
        const fileMetaData = {
            'name': 'wmt.jpg',
            'parents': [GOOGLE_API_FOLDER_ID]
        }

        const media = {
            mimeType: 'image/jpg',
            body: fs.createReadStream('./wmt.jpg')
        }

        const response = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            field: 'id'
        })
        return response.data.id

    } catch (err) {
        console.log('Upload file error', err)
    }
}


async function getFiles() {
    const files = []
    try {
        const response = await driveService.files.list({
            q: 'mimeType=\'application/vnd.google-apps.folder\'',
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive',
        })
        console.log(response)
        return res.data.files
    } catch (err) {
        console.log(err)
        throw err
    }
}

async function deleteFile() {
    const res = await driveService.files.delete({
        'fileId': '1wm_bTgafbEN0FlW3_mruYgsDLTTo_A60'
    })
    // console.log(res)
}

// deleteFile()
// getFiles()



async function test(subject) {
    const subFolders = new Array()
    subFolders.push('Parent: ' + subject)
    console.log(subject)
    const response = await driveService.files.list({
        q: 'mimeType=\'application/vnd.google-apps.folder\' and name = \'' + subject + '\'',
        fields: 'files(id)',
    })
    const id = response.data.files[0].id
    console.log(id)
    let res = await driveService.files.list({
        // q: 'mimeType = \'application/vnd.google-apps.folder\' and name = \'CS 21\'',
        q: '\'' + id + '\' in parents',
        pageSize: 100,
        fields: 'nextPageToken, files(id, name)',
        orderBy: 'name desc'
    })
    const files = res.data.files

    for (item of files) {
        subFolders.push(item.name)
    }
    const ret = subFolders.toString().replaceAll(',', '\n')
    return ret
}

module.exports = { test }