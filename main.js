const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const baileysManager = require('./src/baileys.js');
const { handleIncomingMessage } = require('./src/message-processor.js');

let mainWindow;
let settings = {};
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// --- Settings Management --- //
function saveSettings() {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf-8');
            settings = JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
        settings = {};
    }
}

// --- Electron Window Management --- //
function createWindow() {
    loadSettings();
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('settings-loaded', settings);
    });
}

app.whenReady().then(createWindow);

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

// --- IPC Handlers --- //
ipcMain.on('connect-whatsapp', () => {
    console.log('UI triggered connect');
    baileysManager.connect().catch(err => console.error("Failed to connect:", err));
});

ipcMain.on('disconnect-whatsapp', async () => {
    console.log('UI triggered disconnect');
    await baileysManager.logout();
});

ipcMain.on('save-settings', (_event, newSettings) => {
    settings = newSettings;
    saveSettings();
    console.log('Settings saved.');
    // Optionally, provide feedback to the user
    mainWindow.webContents.send('status-update', 'Configurações salvas!');
});

// --- Baileys Event Listeners --- //
baileysManager.on('qr', (qr) => {
    console.log('Sending QR to UI');
    mainWindow.webContents.send('qr-code', qr);
});

baileysManager.on('status', (status) => {
    console.log(`Sending status to UI: ${status}`);
    mainWindow.webContents.send('status-update', status);
});

baileysManager.on('message', (msg) => {
    console.log('Received message, passing to processor');
    handleIncomingMessage(msg, settings);
});