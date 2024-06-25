import type { CommandInteraction } from 'discord.js';
import { CommandOption } from '../types/types';
import { assertDefined, assertType } from '../assert';

type PossibleValues = string | number | boolean | string[];

type FormattedOption = {
    name: string;
    value: PossibleValues;
};

function formatOptionValue(option: CommandOption, value: PossibleValues): FormattedOption {
    switch (option.name) {
        case 'subjects':
            assertType<string>(value, 'string');
            return {
                name: value || 'All',
                value: value.split(' ').map((s) => s.toLowerCase()),
            };

        default:
            const choice = option.choices.find((c) => c.value === value);
            assertDefined(choice);
            return {
                name: choice.name,
                value: value,
            };
    }
}

export function extractUserOptions<T>(interaction: CommandInteraction, options: CommandOption[]): T {
    const result: Record<string, FormattedOption> = {};
    const userInput = interaction.options;

    for (const option of options) {
        const optionValue = userInput.get(option.name)?.value ?? option.default;
        result[option.name] = formatOptionValue(option, optionValue);
    }

    return result as T;
}
