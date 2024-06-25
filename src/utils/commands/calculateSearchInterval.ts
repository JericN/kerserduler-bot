type DateSpan = { start: Date; end: Date };

function getMonday(): Date {
    const today = new Date();
    const firstDay = today.getDate() - today.getDay() + 1;
    return new Date(today.setDate(firstDay));
}

function addDaysToDate(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

export function calculateSearchInterval(span: number, align: string): DateSpan {
    const start = align === 'monday' ? getMonday() : new Date();
    const end = addDaysToDate(start, span * 7 - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
