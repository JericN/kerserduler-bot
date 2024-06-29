import { CommandInteraction, Role } from 'discord.js';
import { assertDefined } from '../assert';

export function fetchActiveRoles(interaction: CommandInteraction) {
    assertDefined(interaction.guild, 'Guild not found');

    const roles: Record<string, Role> = {};
    interaction.guild?.roles.cache.forEach((channel) => {
        const name = channel.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        roles[name] = channel;
    });

    return roles;
}
