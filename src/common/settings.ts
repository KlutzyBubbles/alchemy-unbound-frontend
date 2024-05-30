export type BackgroundType = 'blank' | 'line' | 'bubble' | 'themeSand' | 'themePink' | 'themeBlue' // | 'particles' | 'rain'

export const BackgroundTypeList: BackgroundType[] = [
    'blank',
    'line',
    'bubble',
    'themeSand',
    'themePink',
    'themeBlue'
];

export type ThemeType = 
| 'dark'
| 'light'
| 'supporter'
| 'themePurple'
| 'themeOrange'
| 'themeSand'
| 'themeBlue'
| 'themePink'
//| 'purple' // | 'github' | 'steam' | 'discord'

export const ThemeTypeList: ThemeType[] = [
    'dark',
    'light',
    'supporter',
    'themePurple',
    'themeSand',
    'themeOrange',
    'themeBlue',
    'themePink'
];

export type LeftRight = 'left' | 'right'

export type Language = 
| 'english'
| 'schinese'
| 'french'
| 'russian'
| 'spanish'
| 'japanese'
| 'indonesian'
| 'german'
| 'latam'
| 'italian'
| 'dutch'
| 'polish'
| 'portuguese'
| 'tchinese'
| 'koreana'

export const languages: Language[] = [
    'english',
    'schinese',
    'french',
    'russian',
    'spanish',
    'japanese',
    'indonesian',
    'german',
    'latam',
    'italian',
    'dutch',
    'polish',
    'portuguese',
    'tchinese',
    'koreana'
];

export const languageDisplay: {
    [K in Language]: {
        native: string,
        english: string
    }
} = {
    english: {
        native: 'English',
        english: 'English'
    },
    schinese: {
        native: '简体中文',
        english: 'Chinese (Simplified)'
    },
    russian: {
        native: 'Русский',
        english: 'Russian'
    },
    spanish: {
        native: 'Español-España',
        english: 'Spanish-Spain'
    },
    french: {
        native: 'Français',
        english: 'French'
    },
    japanese: {
        native: '日本語',
        english: 'Japanese'
    },
    indonesian: {
        native: 'Bahasa Indonesia',
        english: 'Indonesian'
    },
    german: {
        native: 'Deutsch',
        english: 'German'
    },
    latam: {
        native: 'Español-Latinoamérica',
        english: 'Spanish-Latin America'
    },
    italian: {
        native: 'Italiano',
        english: 'Italian'
    },
    dutch: {
        native: 'Nederlands',
        english: 'Dutch'
    },
    polish: {
        native: 'Polski',
        english: 'Polish'
    },
    portuguese: {
        native: 'Português',
        english: 'Portuguese'
    },
    tchinese: {
        native: '繁體中文',
        english: 'Chinese (Traditional)'
    },
    koreana: {
        native: '한국어',
        english: 'Korean'
    }
};

export type Settings = {
    theme: ThemeType
    fullscreen: boolean
    offline: boolean
    currentDisplay: number
    background: BackgroundType
    sidebar: LeftRight
    language: Language
    languageSet: boolean
    volume: number
    muted: boolean
    fps: number
    keybinds: Keybinds
}

export type Keybinds = {
    lock: string,
    copy: string,
    remove: string
}

// This is here for future settings changes
export type RawSettings = {
    dark?: boolean
    theme?: ThemeType
    fullscreen: boolean
    offline: boolean
    currentDisplay: number
    background: BackgroundType
    sidebar: LeftRight
    language: Language
    languageSet: boolean
    volume: number
    muted: boolean
    fps: number
    keybinds?: Keybinds
}

export const DEFAULT_SETTINGS: Settings = {
    theme: 'dark',
    fullscreen: true,
    offline: false,
    currentDisplay: 1,
    background: 'line',
    sidebar: 'right',
    language: 'english',
    languageSet: false,
    volume: 0.5,
    muted: false,
    fps: 120,
    keybinds: {
        lock: 'l',
        copy: 'Control',
        remove: 'Alt'
    }
};
