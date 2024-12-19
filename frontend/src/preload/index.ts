import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
  ping: (): Promise<void> => {
    return ipcRenderer.invoke("ping");
  },
  textGeneration: (text: string): Promise<string> => {
    return ipcRenderer.invoke("doTextGeneration", text);
  },
  run: (text: string): Promise<string> =>
    ipcRenderer.invoke("transformers:run", text),
  onUpdateCounter: (callback: (value: number) => void): Electron.IpcRenderer =>
    ipcRenderer.on("update-counter", (_event, value: number) =>
      callback(value),
    ),
  onUpdateMessage: (callback: (value: string) => void): Electron.IpcRenderer =>
    ipcRenderer.on("update-message", (_event, value: string) =>
      callback(value),
    ),
  counterValue: (value: number): void =>
    ipcRenderer.send("counter-value", value),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
