const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('show-open-dialog'),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  onLoadVideoFile: (callback) => ipcRenderer.on('load-video-file', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});