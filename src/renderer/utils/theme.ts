import { ThemeType } from '../../common/settings';

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

const supporterTheme: Theme = {
    background: '171a25',
    foreground: 'dcdedf',
    primary: '66c0f4'
};

const sandTheme: Theme = {
    background: 'e8d8b8',
    foreground: '4D4637',
    primary: '0d6efd'
};

const blueTheme: Theme = {
    background: '9dd5ff',
    foreground: 'e3f6ff',
    primary: '0d6efd'
};

const pinkTheme: Theme = {
    background: 'fdb1dd',
    foreground: 'fee0f1', // 'f7c2d8', //'5f416d',
    primary: 'ed609e'
};

const purpleTheme: Theme = {
    background: '240046',
    foreground: 'c77dff',
    primary: '0d6efd'
};

const orangeTheme: Theme = {
    background: 'ff834c',
    foreground: 'a43e00',
    primary: '5A78AB'
};

export function getColor(color: ColorType, theme: ThemeType): string {
    if (theme === 'dark') {
        return darkTheme[color];
    } else if (theme === 'supporter') {
        return supporterTheme[color];
    } else if (theme === 'themeSand') {
        return sandTheme[color];
    } else if (theme === 'themePurple') {
        return purpleTheme[color];
    } else if (theme === 'themeOrange') {
        return orangeTheme[color];
    } else if (theme === 'themeBlue') {
        return blueTheme[color];
    } else if (theme === 'themePink') {
        return pinkTheme[color];
    }
    return lightTheme[color];
}

export type LegacyColor = 'light' | 'dark';

export function getLegacyColor(theme: ThemeType): LegacyColor {
    if (theme === 'dark') {
        return 'dark';
    } else if (theme === 'supporter') {
        return 'dark';
    } else if (theme === 'themePurple') {
        return 'dark';
    } else if (theme === 'themeOrange') {
        return 'dark';
    } else if (theme === 'themeSand') {
        return 'light';
    } else if (theme === 'themeBlue') {
        return 'light';
    } else {
        return 'light';
    }
}

export function invertLegacyColor(color: LegacyColor): LegacyColor {
    if (color === 'dark') {
        return 'light';
    }
    return 'dark';
}
