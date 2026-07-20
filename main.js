const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow (width = 390, height = 844) {
  if (mainWindow) {
    mainWindow.close();
  }

  // Create a frameless, transparent window for the device
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    title: "Mobile Simulator",
    transparent: true,
    frame: false,
    resizable: false, // Keep aspect ratio fixed
    hasShadow: true,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Listen for device change events from the frontend
ipcMain.on('resize-device', (event, { width, height }) => {
  // Get the primary display's working area (screen size minus taskbar)
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { height: screenHeight } = primaryDisplay.workAreaSize;

  // If the requested height is larger than the screen, scale it down
  let finalWidth = width;
  let finalHeight = height;
  
  // Add a small buffer (e.g., 40px) so it doesn't touch the exact edges of the monitor
  const maxHeight = screenHeight - 40; 

  if (height > maxHeight) {
      // Calculate ratio to scale down proportionally
      const ratio = maxHeight / height;
      finalHeight = maxHeight;
      finalWidth = Math.round(width * ratio);
  }

  mainWindow.setSize(finalWidth, finalHeight);
  mainWindow.center(); // Recenter on the screen when resized
});
