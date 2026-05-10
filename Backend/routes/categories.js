const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const pool    = require('../db/database');

const DEFAULTS = {
  moneypad: [
    { name:'Food', icon:'🍜' }, { name:'Travel', icon:'🚌' },
    { name:'Shopping', icon:'🛍️' }, { name:'Health', icon:'💊' },
    { name:'Entertainment', icon:'🎬' }, { name:'Other', icon:'📦' },
  ],
  todo: [
    { name:'Work', icon:'💼' }, { name:'Personal', icon:'🏠' },
    { name:'Health', icon:'💪' }, { name:'Study', icon:'📚' },
    { name:'Other', icon:'📌' },
  ],
};

router.get('/', auth, async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ message: 'type required' });
  let { rows } = await pool.query(
    'SELECT * FROM categories WHERE user_id=$1 AND type=$2 ORDER BY id ASC',
    [req.userId, type]
  );
  if (rows.length === 0) {
    for (const c of DEFAULTS[type] || []) {
      await pool.query(
        'INSERT INTO categories (user_id,type,name,icon) VALUES ($1,$2,$3,$4)',
        [req.userId, type, c.name, c.icon]
      );
    }
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id=$1 AND type=$2 ORDER BY id ASC',
      [req.userId, type]
    );
    rows = result.rows;
  }
  res.json({ categories: rows });
});

router.post('/', auth, async (req, res) => {
  const { type, name, icon } = req.body;
  if (!type || !name) return res.status(400).json({ message: 'type and name required' });
  const existing = await pool.query(
    'SELECT id FROM categories WHERE user_id=$1 AND type=$2 AND name=$3',
    [req.userId, type, name]
  );
  if (existing.rows.length) return res.status(409).json({ message: 'Category already exists' });
  const result = await pool.query(
    'INSERT INTO categories (user_id,type,name,icon) VALUES ($1,$2,$3,$4) RETURNING id',
    [req.userId, type, name, icon||'📌']
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id', auth, async (req, res) => {
  const { name, icon } = req.body;
  await pool.query('UPDATE categories SET name=$1,icon=$2 WHERE id=$3 AND user_id=$4',
    [name, icon, req.params.id, req.userId]);
  res.json({ message: 'updated' });
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id=$1 AND user_id=$2',
    [req.params.id, req.userId]);
  res.json({ message: 'deleted' });
});

module.exports = router;