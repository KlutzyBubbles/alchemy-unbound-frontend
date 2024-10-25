import { Languages } from '../../common/types';
import { Language, languages } from '../../common/settings';
import { LanguageStore, LanguageStoreItem, LanguageStoreRecurring } from './store';
import { hasProp } from '../../common/utils';
import logger from 'electron-log/renderer';

function fillPartial(object: LanguageStoreItem): Languages {
    for (const languageKey of languages) {
        if (!hasProp(object, languageKey) || object[languageKey] === undefined || object[languageKey] === null) {
            object[languageKey] = object.english;
        }
    }
    return object as Languages;
}

function getRawObjectFromStore(name: string): Languages {
    if (name.includes('.')) {
        const tree = name.split('.');
        let workingSection: LanguageStoreItem | LanguageStoreRecurring = LanguageStore;
        let found = 0;
        for (const branch of tree) {
            found++;
            if (hasProp(workingSection, 'english')) {
                if (found < tree.length) {
                    logger.warn('Found language before tree end (requested, found)', name, tree.slice(0, found).join(','));
                }
                return fillPartial(workingSection as LanguageStoreItem);
            } else {
                const recurring = workingSection as LanguageStoreRecurring;
                if (hasProp(recurring, branch)) {
                    workingSection = recurring[branch];
                    continue;
                } else {
                    logger.warn('getObjectFromStore INVALID_LANGUAGE_TREE', name);
                    return getPlaceholderLanguage('INVALID');
                }
            }
        }
        if (hasProp(workingSection, 'english')) {
            return fillPartial(workingSection as LanguageStoreItem);
        } else {
            logger.warn('getObjectFromStore INVALID_LANGUAGE_TREE_DEF', name);
            return getPlaceholderLanguage('INVALID');
        }
    } else {
        if (hasProp(LanguageStore, name)) {
            if (hasProp(LanguageStore[name], 'latam')) {
                return (LanguageStore[name] as Languages);
            }
            logger.warn('getObjectFromStore INVALID_LANGUAGE_DEF', name);
            return getPlaceholderLanguage('INVALID');
        }
    }
    logger.warn('getObjectFromStore UNKNOWN_LANGUAGE_DEF', name);
    return getPlaceholderLanguage('INVALID');
}

export function getFromStore(name: string, language: Language): string {
    const foundStore = getRawObjectFromStore(name);
    if (foundStore.latam === 'INVALID') {
        return `UNKNOWN_LANGUAGE_DEF (${name})`;
    }
    return foundStore[language];
}

export function getObjectFromStore(name: string, defaultItem: string): Languages {
    const foundStore = getRawObjectFromStore(name);
    if (foundStore.latam === 'INVALID') {
        return getPlaceholderLanguage(defaultItem);
    }
    return foundStore;
}

export function getPlaceholderLanguage(item: string): Languages {
    const temp: Partial<Languages> = {};
    for (const language of languages) {
        temp[language] = item;
    }
    return temp as Languages;
}
