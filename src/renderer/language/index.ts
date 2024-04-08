import { Languages } from '../../common/types';
import { Language, languages } from '../../common/settings';
import { LanguageStore } from './store';

export function getFromStore<T extends keyof typeof LanguageStore> (name: T, language: Language): string {
    if (Object.prototype.hasOwnProperty.call(LanguageStore, name)) {
        return LanguageStore[name][language];
    }
    return 'UNKNOWN_LANGUAGE_DEF';
}

export function getObjectFromStore<T extends keyof typeof LanguageStore> (name: T, defaultItem: string): Languages {
    if (Object.prototype.hasOwnProperty.call(LanguageStore, name)) {
        return LanguageStore[name];
    }
    return getPlaceholderLanguage(defaultItem);
}

export function getPlaceholderLanguage(item: string): Languages {
    const temp: Partial<Languages> = {};
    for (const language of languages) {
        temp[language] = item;
    }
    return temp as Languages;
}
