import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTodoStore from '../../store/todoStore';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PRIORITY_COLOR = { high: '#b85c3a', medium: '#c47f3a', low: '#5a7c4f' };

const getDayIndicator = (done, total) => {
  if (total === 0) return { icon: '⬜', cls: 'empty' };
  if (done === total) return { icon: '🟢', cls: 'clear' };
  const pct = done / total;
  if (pct >= 0.4) return { icon: '🟡', cls: 'near' };
  return { icon: '🔴', cls: 'behind' };
};

const WeeklyPage = () => {
  const navigate = useNavigate();
  const {
    monday, weekDates, summary, dailySummary, upcoming, isLoading,
    fetchWeek, prevWeek, nextWeek, goToday,
  } = useTodoStore();

  useEffect(() => { fetchWeek(monday); }, [monday]);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Week label เช่น "6–12 May"
  const weekLabel = (() => {
    const start = new Date(weekDates[0] + 'T12:00:00');
    const end = new Date(weekDates[6] + 'T12:00:00');
    const startStr = `${start.getDate()} ${start.toLocaleDateString('en-GB', { month: 'short' })}`;
    const endStr = `${end.getDate()} ${end.toLocaleDateString('en-GB', { month: 'short' })}`;
    return `${startStr} – ${endStr}`;
  })();

  const progress = summary.total > 0
    ? Math.round(summary.done / summary.total * 100) : 0;

  return (
    <div className="mp-page">

      {/* Week Navigator */}
      <div className="mp-nav" style={{ marginTop: '8px' }}>
        <button onClick={prevWeek}>‹</button>
        <span className="mp-month-label" style={{ fontSize: '16px' }}>
          Week: {weekLabel}
        </span>
        <button onClick={goToday} className="mp-today-btn">Today</button>
        <button onClick={nextWeek}>›</button>
      </div>

      {/* Weekly Summary */}
      <div className="mp-card">
        <div className="mp-section-title">🎯 Weekly Summary</div>
        <div className="todo-summary-grid">
          <div className="todo-stat">
            <span>Tasks</span><strong>{summary.total}</strong>
          </div>
          <div className="todo-stat">
            <span>Done</span><strong style={{ color: 'var(--income)' }}>{summary.done}</strong>
          </div>
          <div className="todo-stat">
            <span>Pending</span><strong style={{ color: 'var(--expense)' }}>{summary.pending}</strong>
          </div>
          <div className="todo-stat">
            <span>Progress</span><strong style={{ color: 'var(--caramel)' }}>{progress}%</strong>
          </div>
        </div>
        <div className="mp-budget-bar-bg" style={{ marginTop: '10px' }}>
          <div className="mp-budget-bar"
            style={{ width: `${progress}%`, background: progress === 100 ? 'var(--income)' : 'var(--caramel)' }}
          />
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="mp-card">
        <div className="mp-section-title">📅 This Week</div>
        <div className="todo-week-grid">
          {weekDates.map((date, i) => {
            const ds = dailySummary[date] || { total: 0, done: 0 };
            const ind = getDayIndicator(ds.done, ds.total);
            const isToday = date === todayStr;
            return (
              <div key={date}
                className={`todo-day-cell ${isToday ? 'today' : ''} ${ind.cls}`}
                onClick={() => navigate(`/todo/daily/${date}`)}
              >
                <div className="todo-day-name">{DAY_NAMES[i]}</div>
                <div className="todo-day-date">
                  {new Date(date + 'T00:00:00').getDate()}
                </div>
                <div className="todo-day-icon">{ind.icon}</div>
                <div className="todo-day-stat">
                  {ds.total > 0 ? `${ds.done}/${ds.total}` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcoming.length > 0 && (
        <div className="mp-card">
          <div className="mp-section-title">📌 Upcoming Deadlines</div>
          {upcoming.map(t => {
            const daysLeft = Math.ceil(
              (new Date(t.deadline) - new Date()) / 86400000
            );
            const urgent = daysLeft <= 1;
            return (
              <div key={t.id} className="todo-deadline-row">
                <div className="todo-deadline-left">
                  <span className="todo-deadline-dot"
                    style={{ background: PRIORITY_COLOR[t.priority] }}
                  />
                  <span className="todo-deadline-title">{t.title}</span>
                </div>
                <div className="todo-deadline-right">
                  <span className="todo-deadline-date">{t.deadline}</span>
                  <span className={`todo-deadline-badge ${urgent ? 'urgent' : 'soon'}`}>
                    {urgent ? '🔴' : '🟡'} {daysLeft}d left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default WeeklyPage;