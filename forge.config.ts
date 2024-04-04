import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
    packagerConfig: {
        appCopyright: 'Copyright (C) 2024 KlutzyBubbles',
        prune: true,
        asar: {
            unpack: '*.{node,dll,dylib,so,lib}',
        },
        icon: './icons/icon.ico',
        ignore: [
            'node_modules',
            'src',
            '.github',
            '.zip',
            'pages',
            'icons',
            'webpack.main.config.ts',
            'webpack.plugins.ts',
            'webpack.renderer.config.ts',
            'webpack.rules.ts',
            'tsconfig.json',
            'package.json',
            'package-lock.json',
            'readme.md',
            'forge.config.ts',
            '.gitignore',
            '.gitattributes',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.json',
        ],
    },
    rebuildConfig: {},
    makers: [new MakerZIP({}, ['darwin', 'linux', 'win32'])],
    plugins: [
        new WebpackPlugin({
            mainConfig,
            devContentSecurityPolicy: '',
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.ts',
                        name: 'main_window',
                        preload: {
                            js: './src/preload/index.ts',
                        },
                    },
                ],
            },
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
            [FuseV1Options.OnlyLoadAppFromAsar]: false,
        }),
    ],
};

export default config;
