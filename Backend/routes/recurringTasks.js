const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const pool    = require('../db/database');

router.get('/', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM recurring_tasks WHERE user_id=$1 ORDER BY id ASC', [req.userId]
  );
  res.json({ recurringTasks: rows });
});

router.post('/', auth, async (req, res) => {
  const { title, priority, time_start, time_end, note } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });
  const result = await pool.query(`
    INSERT INTO recurring_tasks (user_id,title,priority,time_start,time_end,note)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
  `, [req.userId, title, priority||'medium', time_start||null, time_end||null, note||'']);
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id', auth, async (req, res) => {
  const { title, priority, time_start, time_end, note } = req.body;
  await pool.query(`
    UPDATE recurring_tasks SET title=$1,priority=$2,time_start=$3,time_end=$4,note=$5
    WHERE id=$6 AND user_id=$7
  `, [title, priority, time_start||null, time_end||null, note||'', req.params.id, req.userId]);
  res.json({ message: 'updated' });
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM recurring_tasks WHERE id=$1 AND user_id=$2',
    [req.params.id, req.userId]);
  res.json({ message: 'deleted' });
});

module.exports = router;