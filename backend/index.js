require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');

// Configuration de la base de données (support soit DATABASE_URL, soit variables séparées)
let pool;
(function initDbPool() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    console.log('[DB] Mode connectionString');
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
      console.log('[DB] Mode champs séparés');
    } else {
      console.error('[DB] Aucune configuration trouvée. Définissez DATABASE_URL ou PGHOST/PGUSER/PGDATABASE (optionnel: PGPASSWORD, PGPORT).');
      console.error('Exemple .env local sans mot de passe:\nDATABASE_URL=postgres://lockup@localhost:5432/lockup');
      console.error('Ou configuration séparée:\nPGHOST=localhost\nPGUSER=lockup\nPGDATABASE=lockup\nPGPASSWORD=pass (optionnel)');
      process.exit(1);
    }
  }
})();

async function dbQuery(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Création des tables si elles n'existent pas
async function ensureTables() {
  await dbQuery(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await dbQuery(`CREATE TABLE IF NOT EXISTS vault_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pseudo TEXT NOT NULL,
    url TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', methods: ['GET','POST','PUT','DELETE'] }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Rate limiting basique pour limiter les tentatives d'auth
const authLimiter = rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth/', authLimiter);

// Middleware d'authentification JWT
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = auth.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Health check
app.get('/health', async (req, res) => {
  try {
    await dbQuery('SELECT 1');
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'down', error: e.message });
  }
});

// Enregistrement
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const hash = await argon2.hash(password);
    const result = await dbQuery('INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id, email', [email, hash]);
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '12h' });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const result = await dbQuery('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Identifiants invalides' });
    const user = result.rows[0];
    const ok = await argon2.verify(user.password_hash, password);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste des entrées du coffre
app.get('/api/vault', authMiddleware, async (req, res) => {
  try {
    const result = await dbQuery('SELECT id, pseudo, url, password_encrypted, created_at FROM vault_items WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupération d'une entrée spécifique
app.get('/api/vault/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbQuery('SELECT id, pseudo, url, password_encrypted, created_at FROM vault_items WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Création d'une entrée
app.post('/api/vault', authMiddleware, async (req, res) => {
  const { pseudo, url, password_encrypted } = req.body || {};
  if (!pseudo || !url || !password_encrypted) return res.status(400).json({ error: 'Champs requis manquants' });
  try {
    const result = await dbQuery('INSERT INTO vault_items(user_id, pseudo, url, password_encrypted) VALUES($1,$2,$3,$4) RETURNING id, pseudo, url, password_encrypted, created_at', [req.user.id, pseudo, url, password_encrypted]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour d'une entrée
app.put('/api/vault/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { pseudo, url, password_encrypted } = req.body || {};
  if (!pseudo && !url && !password_encrypted) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  const fields = [];
  const values = [];
  let idx = 1;
  if (pseudo) { fields.push(`pseudo=$${idx++}`); values.push(pseudo); }
  if (url) { fields.push(`url=$${idx++}`); values.push(url); }
  if (password_encrypted) { fields.push(`password_encrypted=$${idx++}`); values.push(password_encrypted); }
  values.push(id); // id position
  values.push(req.user.id); // user id position
  try {
    const result = await dbQuery(`UPDATE vault_items SET ${fields.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING id, pseudo, url, password_encrypted, created_at`, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Suppression d'une entrée
app.delete('/api/vault/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbQuery('DELETE FROM vault_items WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Introuvable' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Gestion des 404 API
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint inconnu' });
  }
  next();
});

// Middleware d'erreurs
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function waitForDb(retries = 10, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await dbQuery('SELECT 1');
      if (attempt > 1) {
        console.log(`Connexion base OK (tentative ${attempt})`);
      }
      return;
    } catch (err) {
      console.warn(`DB non disponible (tentative ${attempt}/${retries}): ${err.code || err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs * attempt)); // backoff linéaire
    }
  }
}

async function start() {
  try {
    console.log('Démarrage backend...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'définie' : 'NON définie');
    await waitForDb();
    await ensureTables();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Backend démarré sur http://localhost:${port}`);
    });
  } catch (e) {
    console.error('Échec du démarrage après retries DB:', e);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { app, pool };
