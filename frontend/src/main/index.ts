import { app, shell, BrowserWindow, Menu, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { pipeline, TextGenerationSingle, env } from "@huggingface/transformers";
import icon from "../../resources/icon.png?asset";

function createWindow(): void {
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

  // Handle from renderer
  ipcMain.handle("ping", (e, args) => {
    console.log("ping", args, e);
    ipcMain.emit("reply", ["Hello from renderer"]);
    ipcMain.emit("say", ["Say from renderer"]);
    return "pong";
  });
  ipcMain.addListener("say", (args) => console.log(`Hello!!! ${args}`));
  ipcMain.handle("doAThing", (_e, [arg0]) => `Test ${arg0}`);
  ipcMain.handle("doTextGeneration", async (_e, [text]: string[]) => {
    // Create a text-generation pipeline
    pipeline("text-generation", "onnx-community/Llama-3.2-1B-Instruct", {
      progress_callback: ({ name, status, loaded, total, progress, file }) => {
        console.log(
          `${name || ""}(${file || ""}):${status} ${loaded || 0}/${total || 0} ${progress || 0}% `,
        );
      },
    })
      .then((generator) => {
        console.log("generator", generator);

        // Define the list of messages
        const messages = [
          {
            role: "system",
            content:
              "日本漫画の月曜日のたわわに出てくる委員長になりきって、返事をしてください。",
          },
          { role: "user", content: text },
        ];
        // Generate a response
        return generator(messages, { max_new_tokens: 128 });
      })
      .then((output: TextGenerationSingle[] | TextGenerationSingle[][]) => {
        // Generate a response
        console.log(JSON.stringify(output));
        if (isTextGenerationSingleArray(output)) {
          mainWindow.webContents.send(
            "update-message",
            output[0].generated_text,
          );
        } else {
          mainWindow.webContents.send(
            "update-message",
            output[0][0].generated_text,
          );
        }
      });
    return "Processing...";
  });
  ipcMain.on("reply", (args) => console.log("reply", args));

  ipcMain.on("counter-value", (_event, value) => {
    console.log(value); // 値が Node のコンソールへ出力されます
  });

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

  // Add a handler for the `transformers:run` event. This enables 2-way communication
  // between the renderer process (UI) and the main process (processing).
  // https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way
  ipcMain.handle("transformers:run", async (_event, text) => {
    const generator = await pipeline(
      // "text-generation",
      "text-classification",
      // "onnx-community/Llama-3.2-1B-Instruct",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
      {
        progress_callback: undefined,
        // progress_callback: ({
        //   name,
        //   status,
        //   loaded,
        //   total,
        //   progress,
        //   file,
        // }) => {
        //   console.log(
        //     `${name || ""}(${file || ""}):${status} ${loaded || 0}/${total || 0} ${progress || 0}% `,
        //   );
        // },
      },
    );
    return JSON.stringify(await generator(text), null, 2);
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Check if the output is a single array of TextGenerationSingle
const isTextGenerationSingleArray = (
  output: TextGenerationSingle[] | TextGenerationSingle[][],
): output is TextGenerationSingle[] => {
  return (
    Array.isArray(output) &&
    output.length > 0 &&
    "generated_text" in output[0] &&
    (typeof output[0].generated_text === "string" ||
      (Array.isArray(output[0].generated_text) &&
        output[0].generated_text.length > 0 &&
        typeof output[0].generated_text[0].content === "string" &&
        typeof output[0].generated_text[0].role === "string"))
  );
};
