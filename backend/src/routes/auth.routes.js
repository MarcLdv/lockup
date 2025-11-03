const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { query } = require('../db/pool');

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  
  try {
    const hash = await argon2.hash(password);
    const result = await query(
      'INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id, email',
      [email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || '',
      { expiresIn: '12h' }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  
  try {
    const result = await query('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Identifiants invalides' });
    
    const user = result.rows[0];
    const ok = await argon2.verify(user.password_hash, password);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '12h' }
    );
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
