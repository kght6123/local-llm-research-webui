import { ElectronAPI } from "@electron-toolkit/preload";
import { OperationProgress } from "../types";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      onUpdateProgress: (callback: (value: OperationProgress) => void) => void;
      install: () => Promise<string>;
    };
  }
}
