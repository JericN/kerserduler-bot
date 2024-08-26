module.exports = {
    deleted: false,
    devOnly: false,
    allowedServerOnly: true,

    name: 'ping',
    description: 'Replies with the bot ping!',
    options: [],

    callback: async (client, interaction) => {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        interaction.editReply(`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`);
    },
};
