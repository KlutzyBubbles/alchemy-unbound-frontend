import { Language } from '../../common/settings';
import { LanguageStore } from './store';

export function getFromStore<T extends keyof typeof LanguageStore> (name: T, language: Language): string {
    if (Object.prototype.hasOwnProperty.call(LanguageStore, name)) {
        return LanguageStore[name][language];
    }
    return 'UNKNOWN_LANGUAGE_DEF';
}
