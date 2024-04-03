import { Language, languages } from '../../common/settings';
import steamworks from '@ai-zen/steamworks.js';
import { PlayerSteamId, auth } from '@ai-zen/steamworks.js/client';
import logger from 'electron-log/main';
import os from 'os';

export const APP_ID = 2858840;

let steamworksClient: Omit<steamworks.Client, 'init' | 'runCallbacks'>;

export function getSteamworksClient(): Omit<steamworks.Client, 'init' | 'runCallbacks'> {
    if (steamworksClient === undefined || steamworksClient === null) {
        steamworksClient = steamworks.init(APP_ID);
    }
    return steamworksClient;
}

export function getSteamId(): PlayerSteamId | undefined {
    const client = getSteamworksClient();
    if (!client) {
        return undefined;
    }
    return client.localplayer.getSteamId();
}

export function getSteamGameLanguage(): Language {
    const client = getSteamworksClient();
    if (!client) {
        return undefined;
    }
    const language = client.apps.currentGameLanguage();
    if (languages.includes(language as Language)) {
        return language as Language;
    }
    return 'english';
}

export function activateAchievement(achievement: string) {
    if (!isAchievementActivated(achievement)) {
        logger.info(`Unlocking achievement ${achievement}`);
        getSteamworksClient().achievement.activate(achievement);
    }
}

export function isAchievementActivated(achievement: string): boolean {
    return getSteamworksClient().achievement.isActivated(achievement);
}

export function isDlcInstalled(appid: number): boolean {
    return getSteamworksClient().apps.isDlcInstalled(appid);
}

export function getFolder() {
    const steamId = getSteamId().steamId64;
    // windows
    if (process.env.APPDATA)
        return `${process.env.APPDATA}\\..\\LocalLow\\KlutzyBubbles\\${APP_ID}\\${steamId}\\`;

    // macOS
    if (process.platform == 'darwin')
        return `${process.env.HOME}/Library/Application Support/KlutzyBubbles/${APP_ID}/${steamId}/`;

    // linux / all others
    return `${os.homedir()}/KlutzyBubbles/${APP_ID}/${steamId}/`;
}

export async function getWebAuthTicket(): Promise<auth.Ticket> {
    return await getSteamworksClient().auth.getSessionTicketWithSteamId(getSteamId().steamId64);
}
