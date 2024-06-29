import { CommandInteraction, TextChannel, ThreadChannel } from 'discord.js';
import { assertDefined } from '../assert';

export async function fetchActiveThreads(channelName: string, interaction: CommandInteraction) {
    // Fetch the channel from the guild
    const guildChannels = interaction.guild?.channels.cache;
    assertDefined(guildChannels, 'Guild channels not found');
    const channel = guildChannels.find((ch) => ch.type === 0 && ch.name === channelName) as TextChannel;
    assertDefined(channel, `Channel ${channelName} not found`);

    // Make archived threads to active
    const archivedThreads = await channel.threads.fetchArchived();
    archivedThreads.threads.forEach(async (thread) => {
        if (thread.archived) await thread.setArchived(false);
    });

    // Fetch active threads
    const activeThreads = await channel.threads.fetchActive();

    // Create a map of threads
    const threads: Record<string, ThreadChannel> = {};
    activeThreads.threads.forEach((thread) => {
        const name = thread.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        threads[name] = thread;
    });

    return threads;
}
