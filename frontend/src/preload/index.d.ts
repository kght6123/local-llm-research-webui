import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      ping: () => Promise<string>;
      textGeneration: (text: string) => Promise<string>;
      run: (text: string) => Promise<string>;
    };
  }
}
