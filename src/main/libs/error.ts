import { ErrorEntry, ErrorEntryAdd } from '../../common/types';

let errors: ErrorEntry[] = [];

export function registerError(entry: ErrorEntryAdd) {
    errors = [{
        ...entry,
        date: new Date()
    }, ...errors.slice(0, 24)];
}

export function getErrors(): ErrorEntry[] {
    return errors;
}
