import { app, BrowserWindow, crashReporter, Menu, net, protocol, shell } from 'electron';
import { createDatabase } from './main/libs/database';
import debug from 'electron-debug';
import steamworks from '@ai-zen/steamworks.js';
import { register } from './main/register';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-assembler';
import { getFolder } from './main/libs/steam';
import path from 'path';
import log from 'electron-log/main';
import util from 'util';
import { saveStats } from './main/libs/stats';
import { saveSettings } from './main/libs/settings';
import { timeoutPromise } from './common/utils';

log.transports.file.resolvePathFn = (variables) => {
    const filename = variables.fileName ?? 'current.log';
    return path.join(getFolder(), 'logs', filename);
};
log.transports.file.transforms.push(({ message }) => {
    const text = util.format(...message.data);
    return [`[${message.date.toLocaleTimeString()}] [${message.variables.processType}] [${message.level}] ${text}`];
});
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.initialize();
log.info('Initialized logger main');

try {
    if (process.type === 'browser') {
        process.on('uncaughtException', (error) => {
            log.error('uncaught exception', error);
        });
    } else {
        window.addEventListener('error', (error) => {
            log.error('uncaught exception', error);
        });
    }
} catch (error) {
    log.error('Failed creating extra error catchers', error);
}

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

app.setPath('crashDumps', getFolder() + 'crashes');
crashReporter.start({ uploadToServer: false });

Menu.setApplicationMenu(null);

debug();

let mainWindow: BrowserWindow | undefined = undefined;

const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 720,
        width: 1280,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            devTools: !app.isPackaged
        },
        icon: __dirname + '/icons/icon.ico'
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
    });

    //const menuBuilder = new MenuBuilder(mainWindow);
    //menuBuilder.buildMenu();

    // Open the DevTools.
    if (!app.isPackaged)
        mainWindow.webContents.openDevTools();
  
    mainWindow.removeMenu();

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
  
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    log.error('Saving thinggiieiei');
    console.log('saving staefts');
    saveStats().then(() => {
        console.log('Saved stats');
    }).catch((e) => {
        log.error('Failed to save stats', e);
    });
    saveSettings().then(() => {
        console.log('Saved settings');
    }).catch((e) => {
        log.error('Failed to save settings', e);
    });
    app.quit();
    app.quit();
    return;
});

app.on('will-quit', () => {
    log.error('Saving things');
    console.log('saving stats');
    timeoutPromise(saveStats(), 10000).then(() => {
        console.log('Saved stats');
    }).catch((e) => {
        log.error('Failed to save stats', e);
    });
    timeoutPromise(saveSettings(), 10000).then(() => {
        console.log('Saved settings');
    }).catch((e) => {
        log.error('Failed to save settings', e);
    });
    app.quit();
    return;
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app
    .whenReady()
    .then(async () => {
        protocol.handle('sound', (request) => {
            return net.fetch('file://' + path.join(__dirname, 'sounds', request.url.slice('sound://'.length)));
        });
        protocol.handle('image', (request) => {
            return net.fetch('file://' + path.join(__dirname, 'images', request.url.slice('image://'.length)));
        });
        await createDatabase();
        register();
        await installExtension(REACT_DEVELOPER_TOOLS);
    })
    .catch(console.log);

steamworks.electronEnableSteamOverlay();
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
