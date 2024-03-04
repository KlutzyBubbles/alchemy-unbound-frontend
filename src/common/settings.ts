export type BackgroundType = 'blank' | 'particles' | 'rain'
export type LeftRight = 'left' | 'right'

export type Language = 'english' | 'schinese' | 'french' | 'russian' | 'spanish' | 'japanese'
export const languages: Language[] = ['english', 'schinese', 'french', 'russian', 'spanish', 'japanese'];

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
    dark: false,
    fullscreen: false,
    currentDisplay: 1,
    background: 'particles',
    sidebar: 'right',
    language: 'english'
};
