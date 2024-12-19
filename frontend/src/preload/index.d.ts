import { ElectronAPI } from "@electron-toolkit/preload";

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
    };
  }
}
