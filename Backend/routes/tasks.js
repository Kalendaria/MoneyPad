const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const pool    = require('../db/database');

router.get('/upcoming', auth, async (req, res) => {
  const days  = req.query.days || 3;
  const today = new Date().toISOString().slice(0,10);
  const limit = new Date();
  limit.setDate(limit.getDate() + Number(days));
  const { rows } = await pool.query(`
    SELECT * FROM tasks
    WHERE user_id=$1 AND deadline BETWEEN $2 AND $3 AND status!='done'
    ORDER BY deadline ASC
  `, [req.userId, today, limit.toISOString().slice(0,10)]);
  res.json({ tasks: rows });
});

router.get('/', auth, async (req, res) => {
  const { start, end, date } = req.query;
  if (date) {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE user_id=$1 AND date=$2 ORDER BY time ASC',
      [req.userId, date]
    );
    return res.json({ tasks: rows });
  }
  if (start && end) {
    const { rows } = await pool.query(`
      SELECT * FROM tasks
      WHERE user_id=$1 AND date BETWEEN $2 AND $3
      ORDER BY date ASC, time ASC
    `, [req.userId, start, end]);

    const dailyMap = {};
    rows.forEach(t => {
      if (!dailyMap[t.date]) dailyMap[t.date] = { total:0, done:0 };
      dailyMap[t.date].total++;
      if (t.status === 'done') dailyMap[t.date].done++;
    });

    return res.json({
      tasks: rows,
      dailySummary: dailyMap,
      summary: {
        total:   rows.length,
        done:    rows.filter(t => t.status==='done').length,
        pending: rows.filter(t => t.status!=='done').length,
      }
    });
  }
  res.status(400).json({ message: 'Provide ?start=&end= or ?date=' });
});

router.post('/', auth, async (req, res) => {
  const { title, date, deadline, status, priority, time, note } = req.body;
  if (!title || !date) return res.status(400).json({ message: 'title and date required' });
  const result = await pool.query(`
    INSERT INTO tasks (user_id,title,date,deadline,status,priority,time,note)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
  `, [req.userId, title, date, deadline||null, status||'todo', priority||'medium', time||null, note||'']);
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id', auth, async (req, res) => {
  const { title, date, deadline, status, priority, time, note } = req.body;
  await pool.query(`
    UPDATE tasks SET title=$1,date=$2,deadline=$3,status=$4,priority=$5,time=$6,note=$7
    WHERE id=$8 AND user_id=$9
  `, [title, date, deadline||null, status, priority, time||null, note||'', req.params.id, req.userId]);
  res.json({ message: 'updated' });
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE tasks SET status=$1 WHERE id=$2 AND user_id=$3',
    [status, req.params.id, req.userId]);
  res.json({ message: 'updated' });
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2',
    [req.params.id, req.userId]);
  res.json({ message: 'deleted' });
});

module.exports = router;