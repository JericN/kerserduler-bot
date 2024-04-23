module.exports = async (client, guildId) => {
    let applicationCommands = [];

    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = await guild.commands;
    } else {
        applicationCommands = await client.application.commands;
    }

    await applicationCommands.fetch();
    return applicationCommands;
};
