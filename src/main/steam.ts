import steamworks from 'steamworks.js';
import { PlayerSteamId } from 'steamworks.js/client';

export const APP_ID = 2858840;

let steamworksClient: Omit<steamworks.Client, "init" | "runCallbacks">;

export function getSteamworksClient(): Omit<steamworks.Client, "init" | "runCallbacks"> {
    if (steamworksClient === undefined || steamworksClient === null) {
        steamworksClient = steamworks.init(APP_ID);
    }
    return steamworksClient;
}

export function getSteamId(): PlayerSteamId | undefined {
    var client = getSteamworksClient()
    if (!client) {
        return undefined
    }
    return client.localplayer.getSteamId()
}

export function activateAchievement(achievement: string) {
    getSteamworksClient().achievement.activate(achievement)
}

export function isAchievementActivated(achievement: string): boolean {
    return getSteamworksClient().achievement.isActivated(achievement)
}

export function getFolder() {
    var steamId = getSteamId().steamId64
    // windows
    if (process.env.APPDATA)
      return `${process.env.APPDATA}\\..\\LocalLow\\KlutzyBubbles\\${APP_ID}\\${steamId}\\`;
  
    // macOS
    if (process.platform == 'darwin')
      return `${process.env.HOME}/Library/Application Support/KlutzyBubbles/${APP_ID}/${steamId}/`;
  
    // linux / all others
    return `~/KlutzyBubbles/${APP_ID}/${steamId}/`;
}
