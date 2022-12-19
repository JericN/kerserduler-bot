const { test } = require('../test.js')

module.exports = {
    name: "Check Status",
    code: "test",

    async execute(client, guild, message, args) {
        await message.channel.send('> Test Command')
        args = args.replace(',', ' ')
        const data = await test(args)
        await message.channel.send('```\n' + data + '\n```')
    }
}