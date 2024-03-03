export type BackgroundType = 'blank' | 'particles' | 'rain'
export type LeftRight = 'left' | 'right'

export type Settings = {
    dark: boolean,
    fullscreen: boolean,
    currentDisplay: number,
    background: BackgroundType
    sidebar: LeftRight
}

export const DEFAULT_SETTINGS: Settings = {
    dark: false,
    fullscreen: false,
    currentDisplay: 1,
    background: 'particles',
    sidebar: 'right'
};