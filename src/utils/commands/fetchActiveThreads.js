export function fetchActiveThreads(channelName, interaction) {
    const guildChannels = interaction.guild.channels.cache;
    const channel = guildChannels.find((ch) => ch.type === 0 && ch.name === channelName);

    const threads = {};
    channel.threads.cache.forEach((thread) => {
        const name = thread.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        threads[name] = thread;
    });
    return threads;
}
