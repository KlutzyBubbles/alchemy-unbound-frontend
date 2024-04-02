import { BrowserWindow, screen } from 'electron';
import logger from 'electron-log/main';

export function getDisplays(): Electron.Display[] {
    return screen.getAllDisplays();
}

export function getCurrentDisplay(): Electron.Display {
    const bounds = BrowserWindow.getFocusedWindow()?.getBounds();
    if (bounds === undefined) {
        return screen.getAllDisplays()[0];
    }
    return screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y });
}

export function moveToDisplay(display: Electron.Display) {
    const windows = BrowserWindow.getAllWindows();
    logger.debug(`moveToDisplay ${windows.length} ${display.id}`);
    if (windows.length > 0) {
        windows.forEach((window) => {
            window.setPosition(display.bounds.x + 50, display.bounds.y + 50, false);
        });
    }
}

export function setFullscreen(fullscreen: boolean) {
    const windows = BrowserWindow.getAllWindows();
    BrowserWindow.getFocusedWindow()?.setFullScreen(fullscreen);
    logger.debug(`setFullscreen ${windows.length} ${fullscreen}`);
    if (windows.length > 0) {
        windows.forEach((window) => {
            logger.debug(`settings fullscreen for ${window.id}`);
            window.setFullScreen(fullscreen);
        });
    }
}
