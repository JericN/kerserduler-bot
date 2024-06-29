export function assert(condition: unknown, msg = 'assertion failed'): asserts condition {
    if (!condition) throw new Error(msg);
}

export function assertDefined<T>(value: T | undefined, msg = 'value is not defined'): asserts value is T {
    if (typeof value === 'undefined') throw new Error(msg);
}
