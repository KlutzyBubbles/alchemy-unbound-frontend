import { contextBridge, ipcRenderer } from 'electron';
import { resetAndBackup } from '../../main/libs/database/recipeStore';
import { ImportExportChannel } from '../../common/ipc';
import { exportDatabase, importFile } from '../../main/libs/importexport';

export const ImportExportAPIName = 'ImportExportAPI';

export interface IImportExportAPI {
    reset: typeof resetAndBackup,
    import: typeof importFile,
    export: typeof exportDatabase,
}

contextBridge.exposeInMainWorld(ImportExportAPIName, {
    reset: () => ipcRenderer.invoke(ImportExportChannel.RESET),
    import: () => ipcRenderer.invoke(ImportExportChannel.IMPORT),
    export: () => ipcRenderer.invoke(ImportExportChannel.EXPORT),
});
