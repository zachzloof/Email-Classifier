import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  // Set these before importing api/index.js — db.js reads USER_DATA_PATH at module load time
  process.env.ELECTRON_RUN = 'true';
  process.env.SERVE_STATIC = 'true';
  process.env.FRONTEND_URL = 'http://localhost:3001';
  process.env.USER_DATA_PATH = app.getPath('userData');

  const { startServer } = await import('../api/index.js');
  await startServer(3001);

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'MailAI',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:3001');
  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(start).catch((err) => {
  dialog.showErrorBox('MailAI Startup Error', err?.stack || err?.message || String(err));
  app.quit();
});

app.on('window-all-closed', () => app.quit());
