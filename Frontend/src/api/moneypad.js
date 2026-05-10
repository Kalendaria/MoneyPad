import api from './axios';

export const fetchMonthData = (month) =>
  api.get(`/transactions?month=${month}`).then(r => r.data);

export const fetchDayData = (date) =>
  api.get(`/transactions?date=${date}`).then(r => r.data);

export const createTransaction = (data) =>
  api.post('/transactions', data).then(r => r.data);

export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data).then(r => r.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then(r => r.data);

export const fetchBudgets = (month) =>
  api.get(`/budgets?month=${month}`).then(r => r.data);

export const saveBudget = (data) =>
  api.put('/budgets', data).then(r => r.data);