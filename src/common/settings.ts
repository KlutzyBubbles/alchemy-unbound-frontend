export type BackgroundType = 'blank' | 'particles' | 'rain'
export type LeftRight = 'left' | 'right'

export type Settings = {
    dark: boolean,
    background: BackgroundType
    sidebar: LeftRight
}

export const DEFAULT_SETTINGS: Settings = {
    dark: false,
    background: 'particles',
    sidebar: 'right'
};