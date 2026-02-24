const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let nextProcess = null;
let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEFAULT_PORT = 3004;

const THEME = {
  bg: '#0c0b0a',
  titleBarBg: '#0c0b0a',
  symbolColor: '#f5f1eb',
};

function isLocalUrl(s) {
  return s && /localhost|127\.0\.0\.1/i.test(s);
}

function toFullUrl(s) {
  if (!s) return null;
  return s.startsWith('http') ? s : `http://${s}`;
}

function getPortFromUrl(s) {
  if (!s) return DEFAULT_PORT;
  const m = s.match(/:(\d+)/);
  return m ? parseInt(m[1], 10) : DEFAULT_PORT;
}

function getConfig() {
  if (isDev) return null;
  try {
    const appPath = path.join(process.resourcesPath, 'app');
    const configPath = path.join(appPath, 'config.json');
    if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (_) {}
  return null;
}

function createWindow() {
  const opts = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: THEME.bg,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    title: 'Free Stoks Photo',
    show: false,
  };
  if (process.platform === 'darwin') opts.titleBarStyle = 'hiddenInset';
  if (process.platform === 'win32') {
    opts.titleBarOverlay = { color: THEME.titleBarBg, symbolColor: THEME.symbolColor };
  }

  mainWindow = new BrowserWindow(opts);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  let url;
  if (isDev) {
    url = `http://127.0.0.1:${process.env.PORT || DEFAULT_PORT}`;
  } else {
    const config = getConfig();
    const siteUrl = config && config.siteUrl;
    if (siteUrl) {
      url = isLocalUrl(siteUrl) ? toFullUrl(siteUrl) : siteUrl;
    } else {
      url = 'https://www.freestoksphoto.com';
    }
  }
  mainWindow.loadURL(url);

  if (isDev) mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; });
}

function startNextServer(port) {
  return new Promise((resolve, reject) => {
    const appPath = path.join(process.resourcesPath, 'app');
    const serverPath = path.join(appPath, 'server.js');
    const env = { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1' };
    nextProcess = spawn('node', [serverPath], { cwd: appPath, env, stdio: 'pipe' });
    nextProcess.stdout.on('data', (d) => { if (/Ready|started|Listening/i.test(String(d))) resolve(); });
    nextProcess.stderr.on('data', (d) => { if (/Ready|started|Listening/i.test(String(d))) resolve(); });
    nextProcess.on('error', reject);
    setTimeout(() => resolve(), 15000);
  });
}

function waitForServer(port, attempts = 60) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    let tried = 0;
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        if (res.statusCode === 200) return resolve();
        if (++tried < attempts) setTimeout(check, 500);
        else reject(new Error('Server did not respond'));
      });
      req.on('error', () => {
        if (++tried < attempts) setTimeout(check, 500);
        else reject(new Error('Server did not start'));
      });
    };
    check();
  });
}

app.whenReady().then(async () => {
  app.setName('Free Stoks Photo');
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = path.resolve(__dirname, '..', 'build', 'icon.png');
    if (fs.existsSync(iconPath)) app.dock.setIcon(nativeImage.createFromPath(iconPath));
  }

  if (!isDev && app.isPackaged) {
    const config = getConfig();
    const siteUrl = config && config.siteUrl;
    if (isLocalUrl(siteUrl)) {
      const port = getPortFromUrl(siteUrl);
      await startNextServer(port);
      await waitForServer(port);
    }
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (nextProcess) { nextProcess.kill(); nextProcess = null; }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
