export type BackgroundType = 'blank' | 'line' // | 'particles' | 'rain'
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

export type Settings = {
    dark: boolean
    fullscreen: boolean
    currentDisplay: number
    background: BackgroundType
    sidebar: LeftRight
    language: Language
}

export type RawSettings = {
    dark: boolean
    fullscreen: boolean
    currentDisplay: number
    background: BackgroundType
    sidebar: LeftRight
    language: Language
}

export const DEFAULT_SETTINGS: Settings = {
    dark: true,
    fullscreen: false,
    currentDisplay: 1,
    background: 'particles',
    sidebar: 'right',
    language: 'english'
};
