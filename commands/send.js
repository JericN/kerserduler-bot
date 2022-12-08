module.exports = {
	name: "Check Status",
	code: "send",

	async execute(client, guild, message, args) {
		message.delete()
		await message.channel.send(args.replaceAll(',', ' '))
	}
}