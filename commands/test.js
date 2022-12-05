module.exports = {
    name: "Test Command",
    code: "test",

    async execute(client, message) {
        await message.channel.send("test")
    }
}