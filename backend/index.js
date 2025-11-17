require('dotenv').config();
const app = require('./src/app');
const { initDbPool, ensureTables, waitForDb } = require('./src/db/pool');
const config = require('./src/config/env');

async function start() {
  try {
    console.log('[Server] Démarrage backend...');
    
    initDbPool();
    await waitForDb();
    await ensureTables();
    
    const port = config.port;
    app.listen(port, () => {
      console.log(`[Server] Serveur démarré sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[Server] Erreur au démarrage:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n[Server] Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Arrêt du serveur...');
  process.exit(0);
});

start();
