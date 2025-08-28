const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    show: process.env.NODE_ENV === 'development' ? true : false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0b0b0b',
      symbolColor: '#ffffff',
      height: 32
    },
    backgroundColor: '#0b0b0b',
    autoHideMenuBar: true,
    menuBarVisible: false,
    maximizable: true,
    minimizable: true,
    closable: true,
    resizable: true
  });

  // Load the app - check if we're in development or production
  if (process.env.NODE_ENV === 'development') {
    // Load from vite dev server with retry (dev server may not be ready yet)
    const devServerUrl = 'http://localhost:3000';
    const maxAttempts = 40;
    const delayMs = 250;
    let attempts = 0;

    const tryLoad = () => {
      attempts += 1;
      mainWindow.loadURL(devServerUrl).catch(() => {
        if (attempts < maxAttempts) {
          setTimeout(tryLoad, delayMs);
        }
      });
    };

    tryLoad();
  } else {
    // Load the built React app
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }

    // Handle command line arguments (file associations)
    const args = process.argv.slice(1);
    const videoFile = args.find(arg => 
      arg.endsWith('.mp4') || arg.endsWith('.avi') || arg.endsWith('.mkv') || 
      arg.endsWith('.mov') || arg.endsWith('.wmv') || arg.endsWith('.webm')
    );
    
    if (videoFile && fs.existsSync(videoFile)) {
      mainWindow.webContents.send('load-video-file', videoFile);
    }
  });

  // In development, ensure we show the window once content is loaded
  if (process.env.NODE_ENV === 'development') {
    const ensureVisible = () => {
      if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    };
    mainWindow.webContents.on('did-finish-load', ensureVisible);
    mainWindow.webContents.on('did-fail-load', () => {
      // keep the window visible; load will retry via tryLoad
      ensureVisible();
    });
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Video...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                {
                  name: 'Video Files',
                  extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm', 'm4v', 'flv', '3gp']
                },
                {
                  name: 'All Files',
                  extensions: ['*']
                }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('load-video-file', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Luna',
              message: 'Luna',
              detail: 'A modern video player built with Electron\nVersion 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle file associations and second instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      // Check if a video file was passed
      const videoFile = commandLine.find(arg => 
        arg.endsWith('.mp4') || arg.endsWith('.avi') || arg.endsWith('.mkv') || 
        arg.endsWith('.mov') || arg.endsWith('.wmv') || arg.endsWith('.webm')
      );
      
      if (videoFile && fs.existsSync(videoFile)) {
        mainWindow.webContents.send('load-video-file', videoFile);
      }
    }
  });

  // This method will be called when Electron has finished initialization
  app.whenReady().then(createWindow);
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle file opening on macOS
app.on('open-file', (event, path) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('load-video-file', path);
  }
});

// IPC handlers
ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Video Files',
        extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm', 'm4v', 'flv', '3gp']
      }
    ]
  });
  
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});