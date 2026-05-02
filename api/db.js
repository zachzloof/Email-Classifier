import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

const DATA_DIR = "./data";
fs.mkdirSync(DATA_DIR, { recursive: true });

const dbCache = new Map();

function sanitizeEmail(email) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

async function initUserSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      graph_id TEXT,
      subject TEXT,
      body TEXT,
      category TEXT,
      priority TEXT,
      summary TEXT,
      suggested_action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS deleted_graph_ids (
      graph_id TEXT PRIMARY KEY,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { await db.exec("ALTER TABLE emails ADD COLUMN graph_id TEXT"); } catch (_) {}
  try { await db.exec("ALTER TABLE emails ADD COLUMN received_at TEXT"); } catch (_) {}

  await db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_emails_graph_id
    ON emails(graph_id) WHERE graph_id IS NOT NULL
  `);
}

export async function getDbForUser(email) {
  if (dbCache.has(email)) return dbCache.get(email);

  const filename = path.join(DATA_DIR, `${sanitizeEmail(email)}.db`);
  const db = await open({ filename, driver: sqlite3.Database });
  await initUserSchema(db);
  dbCache.set(email, db);
  return db;
}

export async function initTokensDB() {
  const db = await open({ filename: "./tokens.db", driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY,
      data TEXT
    )
  `);
  return db;
}
