// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: any, msg = 'assertion failed'): asserts condition {
    if (!condition) throw new Error(msg);
}

export function assertDefined<T>(value: T | undefined, msg = 'value is not defined'): asserts value is T {
    if (typeof value === 'undefined') {
        throw new Error(msg);
    }
}

export function assertType<T>(value: unknown, expectedType: string): asserts value is T {
    if (typeof value !== expectedType) {
        throw new TypeError(`Expected type to be '${expectedType}', but received type '${typeof value}'`);
    }
}
