const bcrypt = require('bcryptjs');
const pool = require('../db/database');
const { signToken } = require('../utils/jwt');

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length)
      return res.status(409).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id',
      [name, email, hash]
    );
    const token = signToken({ id: result.rows[0].id });
    res.status(201).json({ token, user: { id: result.rows[0].id, name, email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken({ id: user.id });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message); // ← เพิ่มบรรทัดนี้
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  const result = await pool.query(
    'SELECT id,name,email,created_at FROM users WHERE id=$1', [req.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json({ user: result.rows[0] });
};

module.exports = { register, login, me };