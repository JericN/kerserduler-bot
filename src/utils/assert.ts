export function assert(condition: any, msg = 'assertion failed'): asserts condition {
    if (!condition) throw new Error(msg);
}