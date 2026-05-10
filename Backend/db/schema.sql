CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  date       TEXT NOT NULL,
  type       TEXT NOT NULL,
  category   TEXT NOT NULL,
  amount     NUMERIC NOT NULL,
  note       TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  month        TEXT NOT NULL,
  category     TEXT NOT NULL,
  limit_amount NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  date       TEXT NOT NULL,
  deadline   TEXT,
  status     TEXT DEFAULT 'todo',
  priority   TEXT DEFAULT 'medium',
  time       TEXT,
  note       TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  type       TEXT NOT NULL,
  name       TEXT NOT NULL,
  icon       TEXT DEFAULT '📌',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_tasks (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  priority   TEXT DEFAULT 'medium',
  time_start TEXT,
  time_end   TEXT,
  note       TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);