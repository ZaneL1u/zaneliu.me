import Database from 'better-sqlite3';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

let _db: Database.Database;

export const useDB = () => {
  if (_db) return _db;

  // Nitro in production runs from .output/server, so we need to be careful with paths.
  // We map the volume to /app/data in Docker.
  // In dev, we might be in project root.
  
  // Using absolute path for safety in Docker container
  const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : resolve(process.cwd(), 'data');
  
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = resolve(dataDir, 'count.db');
  
  _db = new Database(dbPath);
  
  // Init table
  _db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      count INTEGER DEFAULT 0
    );
    INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0);
  `);

  return _db;
};
