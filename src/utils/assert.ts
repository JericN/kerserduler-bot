export function assert(condition: unknown, msg = 'assertion failed'): asserts condition {
    if (!condition) throw Object.assign(new Error(msg), { name: 'AssertError' });
}

export function assertDefined<T>(value: T | undefined, msg = 'value is not defined'): asserts value is T {
    if (typeof value === 'undefined') throw Object.assign(new Error(msg), { name: 'AssertError' });
}
