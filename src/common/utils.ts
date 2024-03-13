export function clamp(number: number, min: number, max: number) {
    return Math.min(Math.max(number, min), max);
}

export function hasProp<O extends NonNullable<unknown>, K extends keyof O>(o: O, k: K): boolean {
    return Object.prototype.hasOwnProperty.call(o, k);
}
