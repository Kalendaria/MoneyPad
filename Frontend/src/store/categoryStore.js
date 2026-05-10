import { create } from 'zustand';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const useCategoryStore = create((set, get) => ({
  moneypadCategories: [],
  todoCategories:     [],
  isLoading:          false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [mp, td] = await Promise.all([
        fetchCategories('moneypad'),
        fetchCategories('todo'),
      ]);
      set({
        moneypadCategories: mp.categories,
        todoCategories:     td.categories,
        isLoading: false,
      });
    } catch { set({ isLoading: false }); }
  },

  addCategory: async (type, name, icon) => {
    await createCategory({ type, name, icon });
    await get().fetchAll();
  },

  editCategory: async (id, name, icon) => {
    await updateCategory(id, { name, icon });
    await get().fetchAll();
  },

  removeCategory: async (id) => {
    await deleteCategory(id);
    await get().fetchAll();
  },
}));

export default useCategoryStore;