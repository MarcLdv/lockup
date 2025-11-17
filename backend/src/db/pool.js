const { Pool } = require('pg');

let pool;

function initDbPool() {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  } else {
    const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
    
    if (PGHOST && PGUSER && PGDATABASE) {
      pool = new Pool({
        host: PGHOST,
        port: PGPORT ? parseInt(PGPORT, 10) : 5432,
        user: PGUSER,
        password: PGPASSWORD || undefined,
        database: PGDATABASE,
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      });
    } else {
      console.error('[DB] Configuration manquante. Définir DATABASE_URL ou PGHOST/PGUSER/PGDATABASE');
      process.exit(1);
    }
  }
  
  return pool;
}

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Création des tables si elles n'existent pas
async function ensureTables() {
    // Users
  await query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  
  // Vault Items
  await query(`CREATE TABLE IF NOT EXISTS vault_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pseudo TEXT NOT NULL,
    url TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
}

async function waitForDb(retries = 10, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await query('SELECT 1');
      if (attempt > 1) {
        console.log(`[DB] Connexion OK (tentative ${attempt})`);
      }
      return;
    } catch (err) {
      console.warn(`[DB] Non disponible (${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
}

module.exports = { initDbPool, query, getPool: () => pool, ensureTables, waitForDb };
