import { ElectronAPI } from "@electron-toolkit/preload";
import { OperationProgress } from "../types";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      ping: () => Promise<string>;
      textGeneration: (text: string) => Promise<string>;
      run: (text: string) => Promise<string>;
      onUpdateCounter: (callback: (value: number) => void) => void;
      onUpdateMessage: (callback: (value: string) => void) => void;
      counterValue: (value: number) => void;
      onUpdateProgress: (callback: (value: OperationProgress) => void) => void;
      install: () => Promise<string>;
      chat: (text: string) => Promise<string>;
    };
  }
}
