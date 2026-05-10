const pool = require('../db/database');

const getByMonth = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ message: 'month is required' });
  try {
    const { rows } = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id=$1 AND to_char(TO_DATE(date,'YYYY-MM-DD'),'YYYY-MM')=$2
      ORDER BY date DESC, created_at DESC
    `, [req.userId, month]);

    const income  = rows.filter(r => r.type==='income') .reduce((s,r) => s + Number(r.amount), 0);
    const expense = rows.filter(r => r.type==='expense').reduce((s,r) => s + Number(r.amount), 0);

    const dailyMap = {};
    rows.forEach(r => {
      const sign = r.type === 'income' ? 1 : -1;
      dailyMap[r.date] = (dailyMap[r.date] || 0) + sign * Number(r.amount);
    });

    res.json({
      transactions: rows,
      summary: { income, expense, balance: income - expense },
      dailyNet: dailyMap,
    });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const getByDate = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'date is required' });
  try {
    const { rows } = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id=$1 AND date=$2
      ORDER BY created_at DESC
    `, [req.userId, date]);

    const income  = rows.filter(r => r.type==='income') .reduce((s,r) => s + Number(r.amount), 0);
    const expense = rows.filter(r => r.type==='expense').reduce((s,r) => s + Number(r.amount), 0);
    res.json({ transactions: rows, summary: { income, expense } });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  const { date, type, category, amount, note } = req.body;
  if (!date || !type || !category || !amount)
    return res.status(400).json({ message: 'date,type,category,amount required' });
  try {
    const result = await pool.query(`
      INSERT INTO transactions (user_id,date,type,category,amount,note)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
    `, [req.userId, date, type, category, amount, note||'']);
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  const { date, type, category, amount, note } = req.body;
  try {
    await pool.query(`
      UPDATE transactions SET date=$1,type=$2,category=$3,amount=$4,note=$5
      WHERE id=$6 AND user_id=$7
    `, [date, type, category, amount, note||'', req.params.id, req.userId]);
    res.json({ message: 'updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id=$1 AND user_id=$2',
      [req.params.id, req.userId]);
    res.json({ message: 'deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getByMonth, getByDate, create, update, remove };