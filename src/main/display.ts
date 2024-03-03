import { BrowserWindow, app, screen } from "electron";

export function getDisplays(): Electron.Display[] {
    return screen.getAllDisplays();
}

export function getCurrentDisplay(): Electron.Display {
    var bounds = BrowserWindow.getFocusedWindow()?.getBounds()
    if (bounds === undefined) {
        return screen.getAllDisplays()[0];
    }
    return screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y });
}

export function moveToDisplay(display: Electron.Display) {
    var windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
        windows.forEach((window) => {
            window.setPosition(display.bounds.x + 50, display.bounds.y + 50, false)
        })
    }
}

export function setFullscreen(fullscreen: boolean) {
    var windows = BrowserWindow.getAllWindows()
    BrowserWindow.getFocusedWindow()?.setFullScreen(fullscreen)
    console.log(`setFullscreen ${windows.length} ${fullscreen}`)
    if (windows.length > 0) {
        windows.forEach((window) => {
            console.log(`settings fullscreen for ${window.id}`)
            window.setFullScreen(fullscreen)
        })
    }
}