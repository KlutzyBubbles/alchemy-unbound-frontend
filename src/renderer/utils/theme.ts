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

//const purpleTheme: Theme = {
//    background: '2D2327',
//    foreground: '8C93A8',
//    primary: '45364B'
//};

export function getColor(color: ColorType, theme: ThemeType): string {
    if (theme === 'dark') {
        return darkTheme[color];
    } else if (theme === 'supporter') {
        return supporterTheme[color];
    } //else if (theme === 'purple') {
    //    return purpleTheme[color];
    //}
    return lightTheme[color];
}
