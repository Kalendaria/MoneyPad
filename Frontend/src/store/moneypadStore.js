import { create } from 'zustand';
import { fetchMonthData, fetchBudgets, saveBudget } from '../api/moneypad';


const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const useMoneypadStore = create((set, get) => ({
  selectedMonth: today(),
  transactions: [],
  summary: { income: 0, expense: 0, balance: 0 },
  dailyNet: {},
  isLoading: false,
  budgets: [],

  fetchMonth: async (month) => {
    set({ isLoading: true });
    try {
      const [txData, bdData] = await Promise.all([
        fetchMonthData(month || get().selectedMonth),
        fetchBudgets(month || get().selectedMonth),
      ]);
      set({
        transactions: txData.transactions,
        summary: txData.summary,
        dailyNet: txData.dailyNet,
        budgets: bdData.budgets,
        isLoading: false,
      });
    } catch { set({ isLoading: false }); }
  },

  prevMonth: () => {
    const [y, m] = get().selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    set({ selectedMonth: next });
    get().fetchMonth(next);
  },

  nextMonth: () => {
    const [y, m] = get().selectedMonth.split('-').map(Number);
    const d = new Date(y, m);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    set({ selectedMonth: next });
    get().fetchMonth(next);
  },

  goToday: () => {
    const m = today();
    set({ selectedMonth: m });
    get().fetchMonth(m);
  },

  fetchBudgets: async (month) => {
    const data = await fetchBudgets(month || get().selectedMonth);
    set({ budgets: data.budgets });
  },

  saveBudget: async (category, limit_amount) => {
    const month = get().selectedMonth;
    await saveBudget({ month, category, limit_amount });
    get().fetchBudgets(month);
  },

}));

export default useMoneypadStore;