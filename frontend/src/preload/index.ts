import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { OperationProgress } from "../types";

// Custom APIs for renderer
const api = {
  install: (): Promise<string> => ipcRenderer.invoke("ollama:install"),
  onUpdateProgress: (
    callback: (value: OperationProgress) => void,
  ): Electron.IpcRenderer =>
    ipcRenderer.on("update-progress", (_event, value: OperationProgress) =>
      callback(value),
    ),
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
