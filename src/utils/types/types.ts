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
