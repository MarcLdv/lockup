import * as SQLite from 'expo-sqlite';

const DB_NAME = 'lockup.db';
const DB_VERSION = 2;

let db: SQLite.SQLiteDatabase | null = null;

async function migrateToV2(): Promise<void> {
  if (!db) return;
  
  console.log('Migration V1 → V2 détectée');
  console.log('Réinitialisation de la base de données...');
  
  await db.execAsync('DROP TABLE IF EXISTS vault_items');
  await db.execAsync(`
    CREATE TABLE vault_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudo TEXT NOT NULL,
      url TEXT NOT NULL,
      password_encrypted TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('Migration V2 terminée');
}

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS vault_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT NOT NULL,
        url TEXT NOT NULL,
        password_encrypted TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ?',
      ['db_version']
    );
    const currentVersion = result ? parseInt(result.value, 10) : 1;
    
    if (currentVersion < DB_VERSION) {
      if (currentVersion === 1) {
        await migrateToV2();
      }
      
      await db.runAsync(
        'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        ['db_version', DB_VERSION.toString()]
      );
      
      console.log(`Base de données mise à jour vers V${DB_VERSION}`);
    } else {
      console.log(`Base de données à jour (V${DB_VERSION})`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

/**
 * Récupère l'instance de la base de données
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Base de données non initialisée. Appelez initDatabase() d\'abord.');
  }
  return db;
}

/**
 * Récupère la version actuelle de la base de données
 */
export async function getDatabaseVersion(): Promise<number> {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ?',
      ['db_version']
    );
    return result ? parseInt(result.value, 10) : 0;
  } catch (error) {
    console.error('Erreur lors de la récupération de la version:', error);
    return 0;
  }
}

/**
 * Ferme la base de données
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Base de données fermée');
  }
}
