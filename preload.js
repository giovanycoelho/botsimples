const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to Main (one-way)
  connectWhatsApp: () => ipcRenderer.send('connect-whatsapp'),
  disconnectWhatsApp: () => ipcRenderer.send('disconnect-whatsapp'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  loadSettings: () => ipcRenderer.send('load-settings'),
  
  // Main to Renderer (listening for events)
  onQRCode: (callback) => ipcRenderer.on('qr-code', (_event, qr) => callback(qr)),
  onStatusUpdate: (callback) => ipcRenderer.on('status-update', (_event, status) => callback(status)),
  onSettingsLoaded: (callback) => ipcRenderer.on('settings-loaded', (_event, settings) => callback(settings)),
});