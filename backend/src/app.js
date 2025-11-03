const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');

// Routes
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const vaultRoutes = require('./routes/vault.routes');

const app = express();

// Middlewares de sécurité
// Helmet pour sécuriser les en-têtes HTTP
app.use(helmet());

// CORS pour sécuriser les requêtes cross-origin
app.use(cors({ 
  origin: config.cors.origin, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'] 
}));

// Compression des réponses pour optimiser la bande passante
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Rate limiting sur les routes d'authentification pour prévenir les attaques par force brute
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vault', vaultRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Erreur serveur interne' 
  });
});

module.exports = app;
