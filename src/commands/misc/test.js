module.exports = {
    deleted: true,

    name: 'test',
    description: 'test',


    callback: async (client, interaction) => {
        await interaction.deferReply();

        interaction.guild.roles.cache.forEach(role => {
            console.log(role.name);
        });



        interaction.editReply(
            `done`
        );
    },

};
