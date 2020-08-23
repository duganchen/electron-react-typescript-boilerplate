import { app, ipcMain, session, BrowserWindow, Menu, MenuItem } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    width: 800,
  });

  // and load the index.html of the app.
  if (isDev) {
    const menu = Menu.getApplicationMenu();
    menu.append(new MenuItem({ label: "Restart", click: () => app.exit(3) }));
    Menu.setApplicationMenu(menu);

    const reactPort =
      process.env.REACT_PORT !== undefined ? process.env.REACT_PORT : "3000";

    mainWindow.loadURL(`http://localhost:${reactPort}/`);
  } else {
    mainWindow.loadFile("./index.html");
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (process.env.DEVTOOLS) {
    await session.defaultSession.loadExtension(process.env.DEVTOOLS);
  }

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

ipcMain.on("ping", () => {
  console.log("ping");
});
