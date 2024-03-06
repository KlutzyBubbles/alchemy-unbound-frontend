export type ColorType = 'background' | 'foreground' | 'primary'

export type Theme = {
    [K in ColorType]: string
}

const lightTheme: Theme = {
    background: 'f5f5f5',
    foreground: '525252',
    primary: '0d6efd'
};

const darkTheme: Theme = {
    background: '171717',
    foreground: 'a3a3a3',
    primary: '0d6efd'
};

export function getColor(color: ColorType, dark: boolean): string {
    if (dark) {
        return darkTheme[color];
    }
    return lightTheme[color];
}
