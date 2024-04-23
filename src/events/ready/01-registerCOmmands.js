const areCommandsDifferent = require('../../utils/discord/areCommandsDifferent');
const getApplicationCommands = require('../../utils/discord/getApplicationCommands');
const getLocalCommands = require('../../utils/discord/getLocalCommands');

module.exports = async (client) => {
    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client);

        for (const localCommand of localCommands) {
            const { name, description, options } = localCommand;

            const existingCommand = await applicationCommands.cache.find(
                (command) => command.name === name,
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`🚮 Deleted command "${name}".`);
                    continue;
                }

                if (areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                    });
                    console.log(`🔁 Edited command "${name}".`);
                    continue;
                }

                console.log(`🆗 Command "${name}" is up to date.`);
            } else {
                if (localCommand.deleted) {
                    console.log(`⏩ Skipped command "${name}"`);
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    options,
                });

                console.log(`🆗 Registered command "${name}."`);
            }
        }
    } catch (error) {
        console.log(`⚠ Error in registering commands: ${error}`);
    }
};
