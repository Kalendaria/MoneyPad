import { create } from 'zustand';
import { fetchRecurringTasks, createRecurringTask, updateRecurringTask, deleteRecurringTask } from '../api/recurringTasks';

const useRecurringTaskStore = create((set, get) => ({
  recurringTasks: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchRecurringTasks();
      set({ recurringTasks: data.recurringTasks, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  addRecurring: async (form) => {
    await createRecurringTask(form);
    await get().fetchAll();
  },

  editRecurring: async (id, form) => {
    await updateRecurringTask(id, form);
    await get().fetchAll();
  },

  removeRecurring: async (id) => {
    await deleteRecurringTask(id);
    await get().fetchAll();
  },
}));

export default useRecurringTaskStore;