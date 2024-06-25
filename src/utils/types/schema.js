import { z } from 'zod';

const PartialCalendarEvent = z.object({
    id: z.string(),
    summary: z.string(),
    start: z.object({
        date: z.string(),
    }),
    end: z.object({
        date: z.string(),
    }),
});

const PartialCalendarEvents = z.array(PartialCalendarEvent);

const AcadEvent = z.object({
    id: z.string(),
    subject: z.string(),
    summary: z.string(),
    startDate: z.date(),
    endDate: z.date(),
});

const AcadEvents = z.array(AcadEvent);

const ListOptions = z.object({
    span: z.number(),
    start: z.string(),
    group: z.string(),
});

const SendOptions = z.object({
    span: z.number(),
    start: z.string(),
    force: z.boolean(),
    subjects: z.array(z.string()),
});

const TransformEvents = PartialCalendarEvents.transform((events) => {
    return events.map((event) => {
        return {
            id: event.id,
            subject: 'None',
            summary: event.summary,
            startDate: new Date(event.start.date),
            endDate: new Date(event.end.date),
        };
    });
});

export default { TransformEvents, AcadEvents, ListOptions, SendOptions };
