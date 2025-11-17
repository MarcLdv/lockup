const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { query } = require('../db/pool');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, pseudo, url, password_encrypted, created_at FROM vault_items WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'SELECT id, pseudo, url, password_encrypted, created_at FROM vault_items WHERE id=$1 AND user_id=$2',
      [id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  const { pseudo, url, password_encrypted } = req.body || {};
  if (!pseudo || !url || !password_encrypted) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  
  try {
    const result = await query(
      'INSERT INTO vault_items(user_id, pseudo, url, password_encrypted) VALUES($1,$2,$3,$4) RETURNING id, pseudo, url, password_encrypted, created_at',
      [req.user.id, pseudo, url, password_encrypted]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { pseudo, url, password_encrypted } = req.body || {};
  
  if (!pseudo && !url && !password_encrypted) {
    return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  }
  
  const fields = [];
  const values = [];
  let idx = 1;
  
  if (pseudo) { fields.push(`pseudo=$${idx++}`); values.push(pseudo); }
  if (url) { fields.push(`url=$${idx++}`); values.push(url); }
  if (password_encrypted) { fields.push(`password_encrypted=$${idx++}`); values.push(password_encrypted); }
  
  values.push(id);
  values.push(req.user.id);
  
  try {
    const result = await query(
      `UPDATE vault_items SET ${fields.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING id, pseudo, url, password_encrypted, created_at`,
      values
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'DELETE FROM vault_items WHERE id=$1 AND user_id=$2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Introuvable' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
