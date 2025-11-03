require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Json Web Token (Sécurisation de l'authentification)
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Cross Origin Resource Sharing (Sécurisation des requêtes cross-origin)
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
  },
  
  // Limitation de débit (Anti-brute force)
  rateLimit: {
    windowMs: 60 * 1000,
    max: 10,
  },
};
