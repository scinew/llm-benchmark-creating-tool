import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrations';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'app.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: Database.Database = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

runMigrations(db);

export default db;
