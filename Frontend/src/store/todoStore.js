import { create } from 'zustand';
import { fetchWeekData, fetchUpcoming } from '../api/todo';

// ได้ Monday ของสัปดาห์ที่ date อยู่ — ทำงานกับ local date
const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0); // กัน timezone shift
  const day = d.getDay();   // 0=Sun 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

// สร้าง 7 วันจาก monday string
const getWeekDates = (monday) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday + 'T12:00:00'); // noon กัน timezone
    d.setDate(d.getDate() + i);
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  });
};

// เลื่อน monday ไป +/- 7 วัน
const shiftWeek = (monday, delta) => {
  const d = new Date(monday + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const initMonday = getMondayOfWeek();

const useTodoStore = create((set, get) => ({
  monday:       initMonday,
  weekDates:    getWeekDates(initMonday),
  tasks:        [],
  dailySummary: {},
  summary:      { total: 0, done: 0, pending: 0 },
  upcoming:     [],
  isLoading:    false,

  fetchWeek: async (monday) => {
    const m     = monday || get().monday;
    const dates = getWeekDates(m);
    const start = dates[0];
    const end   = dates[6];
    set({ isLoading: true });
    try {
      const [weekData, upcomingData] = await Promise.all([
        fetchWeekData(start, end),
        fetchUpcoming(3),
      ]);
      set({
        tasks:        weekData.tasks,
        dailySummary: weekData.dailySummary,
        summary:      weekData.summary,
        upcoming:     upcomingData.tasks,
        isLoading:    false,
      });
    } catch { set({ isLoading: false }); }
  },

  prevWeek: () => {
    const m = shiftWeek(get().monday, -7);
    set({ monday: m, weekDates: getWeekDates(m) });
    get().fetchWeek(m);
  },

  nextWeek: () => {
    const m = shiftWeek(get().monday, 7);
    set({ monday: m, weekDates: getWeekDates(m) });
    get().fetchWeek(m);
  },

  goToday: () => {
    const m = getMondayOfWeek();
    set({ monday: m, weekDates: getWeekDates(m) });
    get().fetchWeek(m);
  },
}));

export { getWeekDates };
export default useTodoStore;