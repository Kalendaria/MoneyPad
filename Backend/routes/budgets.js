const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const pool    = require('../db/database');

router.get('/', auth, async (req, res) => {
  const { month } = req.query;
  const { rows } = await pool.query(
    'SELECT * FROM budgets WHERE user_id=$1 AND month=$2', [req.userId, month]
  );
  res.json({ budgets: rows });
});

router.put('/', auth, async (req, res) => {
  const { month, category, limit_amount } = req.body;
  const existing = await pool.query(
    'SELECT id FROM budgets WHERE user_id=$1 AND month=$2 AND category=$3',
    [req.userId, month, category]
  );
  if (existing.rows.length) {
    await pool.query('UPDATE budgets SET limit_amount=$1 WHERE id=$2',
      [limit_amount, existing.rows[0].id]);
  } else {
    await pool.query(
      'INSERT INTO budgets (user_id,month,category,limit_amount) VALUES ($1,$2,$3,$4)',
      [req.userId, month, category, limit_amount]
    );
  }
  res.json({ message: 'saved' });
});

module.exports = router;