require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const pool    = require('./db/database');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
pool.query(schema).then(() => {
  console.log('Database ready');
}).catch(err => console.error('Schema error:', err));

// เช็คทีละ route
const authRoute         = require('./routes/auth');
const transactionsRoute = require('./routes/transactions');
const budgetsRoute      = require('./routes/budgets');
const tasksRoute        = require('./routes/tasks');
const categoriesRoute   = require('./routes/categories');
const recurringRoute    = require('./routes/recurringTasks');

console.log('auth:', typeof authRoute);
console.log('transactions:', typeof transactionsRoute);
console.log('budgets:', typeof budgetsRoute);
console.log('tasks:', typeof tasksRoute);
console.log('categories:', typeof categoriesRoute);
console.log('recurring:', typeof recurringRoute);

app.use('/api/auth',            authRoute);
app.use('/api/transactions',    transactionsRoute);
app.use('/api/budgets',         budgetsRoute);
app.use('/api/tasks',           tasksRoute);
app.use('/api/categories',      categoriesRoute);
app.use('/api/recurring-tasks', recurringRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));