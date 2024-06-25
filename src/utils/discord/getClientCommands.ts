import { Client, ApplicationCommandManager } from 'discord.js';

export async function getClientCommands(client: Client): Promise<ApplicationCommandManager> {
    const globalCommandsManager = client.application!.commands;
    await globalCommandsManager.fetch({ force: true });
    return globalCommandsManager;
}
