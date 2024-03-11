import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
    packagerConfig: {
        asar: {
            unpack: '*.{node,dll,dylib,so,lib}',
        },
        icon: './icons/icon.ico',
        ignore: ['node_modules/steamworks.js/dist', 'node_modules/@ai-zen/steamworks.js/dist'],
        // extraResource: [
        //     'src/sounds/*'
        // ]
    },
    rebuildConfig: {},
    makers: [new MakerZIP({}, ['darwin', 'linux', 'win32'])],
    plugins: [
    // new AutoUnpackNativesPlugin({}),
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
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;
