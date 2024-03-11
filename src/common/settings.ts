export type BackgroundType = 'blank' | 'line' // | 'particles' | 'rain'

export const BackgroundTypeList: BackgroundType[] = [
    'blank',
    'line'
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
    dark: boolean
    fullscreen: boolean
    offline: boolean
    currentDisplay: number
    background: BackgroundType
    sidebar: LeftRight
    language: Language
    languageSet: boolean
    volume: number
    muted: boolean
}

// This is here for future settings changes
export type RawSettings = {
    dark: boolean
    fullscreen: boolean
    offline: boolean
    currentDisplay: number
    background: BackgroundType
    sidebar: LeftRight
    language: Language
    languageSet: boolean
    volume: number
    muted: boolean
}

export const DEFAULT_SETTINGS: Settings = {
    dark: true,
    fullscreen: true,
    offline: true,
    currentDisplay: 1,
    background: 'line',
    sidebar: 'right',
    language: 'english',
    languageSet: false,
    volume: 0.5,
    muted: false
};
