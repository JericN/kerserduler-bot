import { z } from 'zod';

export const LocalCommand = z.object({
    deleted: z.boolean(),
    devOnly: z.boolean(),
    allowedServerOnly: z.boolean(),
    devServerOnly: z.boolean(),
    name: z.string(),
    description: z.string(),
    options: z.array(z.unknown()),
    callback: z.function().args(z.unknown()).returns(z.unknown()),
});
export type LocalCommand = z.infer<typeof LocalCommand>;

export const AcadEvent = z.object({
    id: z.string(),
    subject: z.string(),
    summary: z.string(),
    startDate: z.date(),
    endDate: z.date(),
});
export type AcadEvent = z.infer<typeof AcadEvent>;

export const FilteredEvents = z.object({
    validEvents: z.array(AcadEvent),
    invalidEvents: z.array(AcadEvent),
});
export type FilteredEvents = z.infer<typeof FilteredEvents>;

export const GroupedEvents = z.record(z.array(AcadEvent));
export type GroupedEvents = z.infer<typeof GroupedEvents>;

export const ListOptions = z.object({
    span: z.object({
        name: z.string(),
        value: z.number(),
    }),
    start: z.object({
        name: z.string(),
        value: z.string(),
    }),
    group: z.object({
        name: z.string(),
        value: z.string(),
    }),
});
export type ListOptions = z.infer<typeof ListOptions>;

const PossibleValues = z.union([z.string(), z.number(), z.boolean()]);

export const CommandOption = z.object({
    name: z.string(),
    description: z.string(),
    type: z.number(),
    required: z.boolean(),
    choices: z.array(z.object({ name: z.string(), value: PossibleValues })),
    default: PossibleValues,
});

export type CommandOption = z.infer<typeof CommandOption>;
