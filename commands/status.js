module.exports = {
	name: "Check Status",
	code: "status",

	async execute(client, guild, message, args) {
		await message.channel.send("I'm Ready! :mask: <@cs20>")
	}
}
