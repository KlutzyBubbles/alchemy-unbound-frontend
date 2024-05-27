import { contextBridge, ipcRenderer } from 'electron';
import { ProfileChannel } from '../../common/ipc';
import { switchProfile } from '../../main/libs/database/profiles';
import { DatabaseData } from '../../common/types/saveFormat';

export const ProfileAPIName = 'ProfileAPI';

export interface IProfileAPI {
    switchProfile: typeof switchProfile,
}

contextBridge.exposeInMainWorld(ProfileAPIName, {
    switchProfile: (profile: string, info: DatabaseData) => ipcRenderer.invoke(ProfileChannel.SWITCH, profile, info),
});
