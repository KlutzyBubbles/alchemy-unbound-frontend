export function clamp(number: number, min: number, max: number) {
    return Math.min(Math.max(number, min), max);
}

export function hasProp<O extends NonNullable<unknown>, K extends keyof O>(o: O, k: K): boolean {
    return Object.prototype.hasOwnProperty.call(o, k);
}

export function arrayEquals(a: unknown[], b: unknown[]) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
