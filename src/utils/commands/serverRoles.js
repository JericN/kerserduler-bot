function fetchActiveRoles(interaction) {
    const roles = {};

    interaction.guild.roles.cache.forEach((channel) => {
        const name = channel.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        roles[name] = channel;
    });

    return roles;
}

module.exports = fetchActiveRoles;
