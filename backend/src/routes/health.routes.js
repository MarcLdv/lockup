const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

module.exports = router;
