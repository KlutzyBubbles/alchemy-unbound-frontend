export function clamp(number: number, min: number, max: number) {
    return Math.min(Math.max(number, min), max);
}

export function hasProp<O extends NonNullable<unknown>, K extends keyof O>(o: O, k: K): boolean {
    if (o === undefined || o === null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(o, k);
}

export function arrayEquals(a: unknown[], b: unknown[]) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export async function timeoutPromise(promise: Promise<unknown>, time: number) {
    return Promise.race([promise, new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Timeout reached')), time))]);
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
