import { LanguageStoreRecurring } from '../../store';
import { LanguageStore as StatsLanguageStore } from './stats';
import { LanguageStore as DevLanguageStore } from './dev';
import { LanguageStore as FilesLanguageStore } from './files';

export const LanguageStore: LanguageStoreRecurring = {
    stats: StatsLanguageStore,
    dev: DevLanguageStore,
    files: FilesLanguageStore,
    alchemyUnbound: {
        english: 'Alchemy Unbound',
        spanish: 'el Alchemy Unbound',
        french: 'Baguette Unbound',
        japanese: 'Alchemy Unboundu',
        portuguese: 'Alchemy Unboundo'
    },
    apiErrorsTitle: {
        english: 'API Errors',
        schinese: 'API错误',
        russian: 'Ошибки API',
        spanish: 'Errores de API',
        french: 'Erreurs d\'API',
        japanese: 'APIエラー',
        indonesian: 'Kesalahan API',
        german: 'API-Fehler',
        latam: 'Errores de API',
        italian: 'Errori API',
        dutch: 'API-fouten',
        polish: 'Błędy interfejsu API',
        portuguese: 'Erros de API',
        tchinese: 'API錯誤',
        koreana: 'API 오류'
    },
};
