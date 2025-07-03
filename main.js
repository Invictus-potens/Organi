const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // In a real app, consider true for security and use a preload script
      // preload: path.join(__dirname, 'preload.js') // Enable if you create a preload.js
    }
  })

  win.loadFile('index.html')

  // Open DevTools if needed
  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  // On macOS, applications and their menu bar stay active until the user quits
  // explicitly with Cmd + Q. On other platforms, quit directly.
  if (process.platform !== 'darwin') app.quit()
})
