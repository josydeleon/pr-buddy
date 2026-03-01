import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import pty from "node-pty";
import fixPath from "fix-path";

// Needed for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix PATH for macOS
fixPath();

// PTY Logic
const shell = os.platform() === "win32" ? "powershell.exe" : "/bin/zsh";
const terminals = new Map<string, pty.IPty>();

ipcMain.on("terminal-create", (event, { id }) => {
  try {
    const cwd = process.env.HOME || process.cwd();
    console.log(`Spawning terminal: shell=${shell}, cwd=${cwd}`);

    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: cwd,
      env: process.env,
    });

    console.log(`Terminal created: ${id}, PID: ${ptyProcess.pid}`);

    terminals.set(id, ptyProcess);

    ptyProcess.onData((data) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send("terminal-output", { id, data });
      }
    });

    ptyProcess.onExit(() => {
      // Cleanup
    });
  } catch (err) {
    console.error("Failed to spawn terminal", err);
  }
});

ipcMain.on("terminal-input", (event, { id, data }) => {
  const term = terminals.get(id);
  if (term) {
    term.write(data);
  } else {
    console.warn(`Terminal ${id} not found for input`);
  }
});

ipcMain.on("terminal-resize", (event, { id, cols, rows }) => {
  const term = terminals.get(id);
  if (term) {
    try {
      term.resize(cols, rows);
    } catch (err) {
      console.error("Resize error", err);
    }
  }
});

ipcMain.on("terminal-kill", (event, { id }) => {
  const term = terminals.get(id);
  if (term) {
    term.kill();
    terminals.delete(id);
  }
});

// The built directory structure
//
// ├─┬─ dist
// │ └── index.html
// ├── dist-electron
// │ ├── main.js
// │ └── preload.js
//
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST || "dist", "index.html"));
  }

  // Open DevTools in production to debug white screen
  // win.webContents.openDevTools();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
