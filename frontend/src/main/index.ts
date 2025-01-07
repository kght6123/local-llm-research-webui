import { app, shell, BrowserWindow, Menu, ipcMain, session } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import installWindows from "./install/install-windows";
import installDarwin from "./install/install-darwin";
import { OperationProgress } from "../types";

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegrationInWorker: true,
    },
  });

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: (): void => mainWindow.webContents.send("update-counter", 1),
          label: "Increment",
        },
        {
          click: (): void => mainWindow.webContents.send("update-counter", -1),
          label: "Decrement",
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("ollama:install", async () => {
    console.log(
      process.platform === "win32" ? "Running on Windows" : "Running on macOS",
      process.platform,
    );
    if (process.platform === "win32")
      await installWindows({
        callback: (progress: OperationProgress) => {
          BrowserWindow.getAllWindows().forEach((window) =>
            window.webContents.send("update-progress", progress),
          );
        },
      });
    else
      await installDarwin({
        callback: (progress: OperationProgress) => {
          BrowserWindow.getAllWindows().forEach((window) =>
            window.webContents.send("update-progress", progress),
          );
        },
      });
    return "インストールが起動しました。画面の指示に従ってください。";
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders["Content-Security-Policy"];
    // console.log("responseHeaders", responseHeaders);
    callback({
      responseHeaders,
      // responseHeaders: {
      //   ...details.responseHeaders,
      //   // "Content-Security-Policy": [
      //   //   "default-src 'self' 'unsafe-inline' 'localhost:5173' '127.0.0.1:11434'",
      //   // ],
      // },
    });
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
