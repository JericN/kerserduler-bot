module.exports = {
	name: "Check Status",
	code: "status",

	async execute(client, message) {
		await message.channel.send("I'm Ready!")
	}
}
