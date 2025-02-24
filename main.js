// 🔄 Enable auto-reloading during development
try {
  require("electron-reloader")(module);
} catch (_) {}

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(app.getPath("userData"), "data.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize; // Get usable screen size

  const windowWidth = 600; // Adjust as needed
  const windowHeight = 400; // Adjust as needed

  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    icon: path.join(__dirname, "assets", "icon.png"), // Path to your icon
    x: width - windowWidth, // Move to the right side
    y: height - windowHeight, // Move to the bottom
    alwaysOnTop: true, // ✅ Keeps the window pinned on top
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();
});

// Load saved data
ipcMain.handle("load-data", () => readData());

// Save new text
ipcMain.handle("save-text", (event, newTitle, newText) => {
  const data = readData();
  const uuid = crypto.randomUUID();

  data.push({
    id: uuid,
    title: newTitle,
    text: newText,
    lastUsed: new Date().toISOString(),
  });
  writeData(data);
  return data;
});

// Update last used time
ipcMain.handle("update-last-used", (event, text) => {
  let data = readData().map((item) =>
    item.text === text ? { ...item, lastUsed: new Date().toISOString() } : item
  );
  writeData(data);
  return data;
});

// Delete text
ipcMain.handle("delete-text", (event, text) => {
  let data = readData().filter((item) => item.text !== text);
  console.log("delete-text", data);
  writeData(data);
  return data;
});
