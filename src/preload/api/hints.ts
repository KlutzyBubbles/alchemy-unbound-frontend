import { contextBridge, ipcRenderer } from 'electron';
import { HintChannel } from '../../common/ipc';
import { addHintPoint, getHint, getHintsLeft, getMaxHints, hintComplete, loadHint, resetHint, saveHint } from '../../main/libs/hints';

export const HintAPIName = 'HintAPI';

export interface IHintAPI {
    addHintPoint: typeof addHintPoint,
    getHint: typeof getHint,
    loadHint: typeof loadHint,
    saveHint: typeof saveHint,
    getMaxHints: typeof getMaxHints,
    getHintsLeft: typeof getHintsLeft,
    resetHint: typeof resetHint,
    hintComplete: typeof hintComplete,
}

contextBridge.exposeInMainWorld(HintAPIName, {
    addHintPoint: (hintPoints: number) => ipcRenderer.invoke(HintChannel.ADD_POINT, hintPoints),
    getHint: (generate: boolean) => ipcRenderer.invoke(HintChannel.GET, generate),
    loadHint: () => ipcRenderer.invoke(HintChannel.LOAD),
    saveHint: () => ipcRenderer.invoke(HintChannel.SAVE),
    getMaxHints: () => ipcRenderer.invoke(HintChannel.GET_MAX),
    getHintsLeft: () => ipcRenderer.invoke(HintChannel.GET_LEFT),
    resetHint: () => ipcRenderer.invoke(HintChannel.RESET),
    hintComplete: () => ipcRenderer.invoke(HintChannel.COMPLETE),
});
