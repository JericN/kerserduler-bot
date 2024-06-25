import { Client, GuildApplicationCommandManager } from 'discord.js';

export async function getGuildCommands(client: Client, guildId: string): Promise<GuildApplicationCommandManager> {
    const guild = await client.guilds.fetch(guildId);
    const guildCommandsManager = guild.commands;
    await guildCommandsManager.fetch({ force: true });
    return guildCommandsManager;
}
