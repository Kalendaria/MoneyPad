import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDayTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../../api/todo';
import useCategoryStore from '../../store/categoryStore';
import useRecurringTaskStore from '../../store/recurringTaskStore';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'doing', 'done'];
const EMPTY_FORM = { title: '', status: 'todo', priority: 'medium', time: '', deadline: '', note: '' };

const PRIORITY_COLOR = { high: '#b85c3a', medium: '#c47f3a', low: '#5a7c4f' };
const STATUS_LABEL = { todo: 'Todo', doing: 'Doing', done: 'Done' };
const fmt = (n) => Number(n).toLocaleString();



const TodoDailyPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();

  const { todoCategories, fetchAll } = useCategoryStore();
  const { recurringTasks, fetchAll: fetchRecurring } = useRecurringTaskStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDayTasks(date);
      setTasks(data.tasks);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [date]);
  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchRecurring(); }, []);


  const applyTemplate = (t) => {
    setForm({
      title: t.title,
      status: 'todo',
      priority: t.priority,
      time: t.time_start || '',
      deadline: '',
      note: t.note || '',
    });
    setShowTemplates(false);
    setModal(true);
  };

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM, date }); setModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title, status: t.status, priority: t.priority,
      time: t.time || '', deadline: t.deadline || '', note: t.note || ''
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('กรุณากรอกชื่อ task');
    const payload = { ...form, date };
    if (editing) await updateTask(editing.id, payload);
    else await createTask(payload);
    closeModal(); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบ task นี้?')) return;
    await deleteTask(id); load();
  };

  const handleStatusChange = async (t) => {
    const next = { todo: 'doing', doing: 'done', done: 'todo' };
    await updateTaskStatus(t.id, next[t.status]);
    load();
  };

  // Filter + Search
  const filtered = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const summary = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  const label = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="mp-page">

      {/* Header */}
      <div className="dp-header">
        <button className="dp-back" onClick={() => navigate('/todo')}>← Back</button>
        <div className="dp-title" style={{ fontSize: '14px' }}>{label}</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="dp-add-btn"
            style={{ background: 'var(--caramel)' }}
            onClick={() => setShowTemplates(!showTemplates)}
          >🔁</button>
          <button className="dp-add-btn" onClick={openAdd}>+ Add</button>
        </div>
      </div>
      {/* Summary */}
      <div className="todo-summary-grid" style={{ marginBottom: '14px' }}>
        <div className="todo-stat">
          <span>Total</span><strong>{summary.total}</strong>
        </div>
        <div className="todo-stat">
          <span>Todo</span>
          <strong style={{ color: 'var(--text-muted)' }}>{summary.todo}</strong>
        </div>
        <div className="todo-stat">
          <span>Doing</span>
          <strong style={{ color: 'var(--caramel)' }}>{summary.doing}</strong>
        </div>
        <div className="todo-stat">
          <span>Done</span>
          <strong style={{ color: 'var(--income)' }}>{summary.done}</strong>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="todo-toolbar">
        <input
          className="todo-search"
          placeholder="🔍 Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="todo-filter-group">
          {['all', 'todo', 'doing', 'done'].map(s => (
            <button key={s}
              className={`todo-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="mp-card">
        {loading && <div className="mp-loading">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="mp-empty">
            {tasks.length === 0 ? 'No tasks today — press + Add' : 'No tasks match filter'}
          </div>
        )}
        {!loading && filtered.map(t => (
          <div key={t.id} className={`todo-task-row ${t.status}`}>

            {/* Status Toggle */}
            <button
              className={`todo-status-btn ${t.status}`}
              onClick={() => handleStatusChange(t)}
              title="Click to change status"
            >
              {t.status === 'done' ? '✅' : t.status === 'doing' ? '🔄' : '⬜'}
            </button>

            {/* Task Info */}
            <div className="todo-task-info">
              <div className={`todo-task-title ${t.status === 'done' ? 'done' : ''}`}>
                {t.title}
              </div>
              <div className="todo-task-meta">
                {t.time && <span>🕐 {t.time}</span>}
                {t.deadline && <span>📅 {t.deadline}</span>}
                {t.note && <span>📝 {t.note}</span>}
              </div>
            </div>

            {/* Priority + Actions */}
            <div className="todo-task-right">
              <span className="todo-priority-dot"
                style={{ background: PRIORITY_COLOR[t.priority] }}
                title={t.priority}
              />
              <button className="dp-edit-btn" onClick={() => openEdit(t)}>Edit</button>
              <button className="dp-delete-btn" onClick={() => handleDelete(t.id)}>Del</button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="dp-overlay" onClick={closeModal}>
          <div className="dp-modal" onClick={e => e.stopPropagation()}>
            <div className="dp-modal-title">
              {editing ? '✏️ Edit Task' : '➕ Add Task'}
            </div>

            <label>Title</label>
            <input type="text" placeholder="Task name..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <label>Status</label>
            <div className="dp-toggle">
              {STATUSES.map(s => (
                <button key={s}
                  className={form.status === s ? 'active' : ''}
                  onClick={() => setForm({ ...form, status: s })}
                >{STATUS_LABEL[s]}</button>
              ))}
            </div>

            <label>Priority</label>
            <div className="dp-toggle">
              {PRIORITIES.map(p => (
                <button key={p}
                  className={form.priority === p ? 'active' : ''}
                  onClick={() => setForm({ ...form, priority: p })}
                  style={form.priority === p ? { background: PRIORITY_COLOR[p], borderColor: PRIORITY_COLOR[p] } : {}}
                >{p}</button>
              ))}
            </div>

            <label>Time</label>
            <input type="time" value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
            />

            <label>Deadline</label>
            <input type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />

            <label>Note</label>
            <input type="text" placeholder="optional..."
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
            />

            <div className="dp-modal-actions">
              <button className="dp-cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="dp-save-btn" onClick={handleSave}>
                {editing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showTemplates && (
        <div className="mp-card" style={{ marginBottom: '10px' }}>
          <div className="mp-section-title">🔁 เลือก Template</div>
          {recurringTasks.length === 0 && (
            <div className="mp-empty">ยังไม่มี template — ไปตั้งที่ Settings</div>
          )}
          {recurringTasks.map(t => (
            <div key={t.id} className="settings-cat-row"
              style={{ cursor: 'pointer' }}
              onClick={() => applyTemplate(t)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t.time_start && `🕐 ${t.time_start}${t.time_end ? ` – ${t.time_end}` : ''}`}
                  {t.note && ` · ${t.note}`}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.priority}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TodoDailyPage;