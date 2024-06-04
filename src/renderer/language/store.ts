import { Languages } from '../../common/types';
import { LanguageStore as SettingsLanguageStore } from './sections/settings';
import { LanguageStore as InfoLanguageStore } from './sections/info';
import { LanguageStore as StoreLanguageStore } from './sections/store';
import { LanguageStore as DialogLanguageStore } from './sections/dialog';
import { LanguageStore as SideLanguageStore } from './sections/side';
import { LanguageStore as ErrorsLanguageStore } from './sections/errors';
import { LanguageStore as ItemLanguageStore } from './sections/item';
import { LanguageStore as MenuLanguageStore } from './sections/menu';
import { LanguageStore as SavesLanguageStore } from './sections/saves';
import { LanguageStore as RecipesLanguageStore } from './sections/recipes';
import { LanguageStore as TimerLanguageStore } from './sections/timer';

export type LanguageStoreRecurring = {
    [key: string]: Languages | LanguageStoreRecurring
}

export const LanguageStore: LanguageStoreRecurring = {
    settings: SettingsLanguageStore,
    info: InfoLanguageStore,
    dialog: DialogLanguageStore,
    side: SideLanguageStore,
    store: StoreLanguageStore,
    errors: ErrorsLanguageStore,
    item: ItemLanguageStore,
    menu: MenuLanguageStore,
    saves: SavesLanguageStore,
    recipes: RecipesLanguageStore,
    timer: TimerLanguageStore,
    hintTooltip: {
        english: 'Click to use a hint point',
        schinese: '点击使用提示点',
        russian: 'Нажмите, чтобы использовать подсказочную точку',
        spanish: 'Haz clic para usar un punto de pista',
        french: 'Cliquez pour utiliser un point d\'indice',
        japanese: 'ヒントポイントを使用するにはクリックしてください',
        indonesian: 'Klik untuk menggunakan poin petunjuk',
        german: 'Klicken Sie, um einen Hinweispunkt zu verwenden',
        latam: 'Haz clic para usar un punto de pista',
        italian: 'Clicca per utilizzare un punto suggerimento',
        dutch: 'Klik om een hintpunt te gebruiken',
        polish: 'Kliknij, aby użyć punktu wskazówki',
        portuguese: 'Clique para usar um ponto de dica',
        tchinese: '點擊使用提示點',
        koreana: '힌트 포인트 사용하려면 클릭하세요'
    },
    creditsLeft: {
        english: 'Credits',
        schinese: '学分',
        russian: 'Кредиты',
        spanish: 'Créditos',
        french: 'Crédits',
        japanese: 'クレジット',
        indonesian: 'Kredit',
        german: 'Kredite',
        latam: 'Créditos',
        italian: 'Crediti',
        dutch: 'Credits',
        polish: 'Kredyty',
        portuguese: 'Créditos',
        tchinese: '學分',
        koreana: '크레딧'
    }
};
