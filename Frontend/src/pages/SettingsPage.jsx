import { useEffect, useState } from 'react';
import useCategoryStore from '../store/categoryStore';
import useRecurringTaskStore from '../store/recurringTaskStore';

const ICONS = ['🍜', '🚌', '🛍️', '💊', '🎬', '📦', '💼', '🏠', '💪', '📚', '📌', '🎵', '✈️', '🐶', '☕', '🏋️'];
const EMPTY_FORM = { name: '', icon: '📌' };
const PRIORITY_COLOR = { high: '#b85c3a', medium: '#c47f3a', low: '#5a7c4f' };
const EMPTY_RECURRING = { title: '', priority: 'medium', time_start: '', time_end: '', note: '' };

// ── Category Section ─────────────────────────────────
const CategorySection = ({ title, type, categories, onAdd, onEdit, onDelete }) => {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return alert('กรุณากรอกชื่อ category');
    if (editing) {
      await onEdit(editing.id, form.name, form.icon);
      setEditing(null);
    } else {
      await onAdd(type, form.name, form.icon);
      setShowAdd(false);
    }
    setForm(EMPTY_FORM);
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon });
    setShowAdd(false);
  };

  return (
    <div className="mp-card">
      <div className="mp-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{title}</span>
        <button className="dp-add-btn" style={{ fontSize: '12px', padding: '4px 12px' }}
          onClick={() => { setShowAdd(!showAdd); setEditing(null); setForm(EMPTY_FORM); }}
        >+ Add</button>
      </div>

      {/* Add / Edit Form */}
      {(showAdd || editing) && (
        <div className="settings-form">
          <div className="settings-icon-grid">
            {ICONS.map(ic => (
              <button key={ic}
                className={`settings-icon-btn ${form.icon === ic ? 'active' : ''}`}
                onClick={() => setForm({ ...form, icon: ic })}
              >{ic}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              placeholder="Category name..."
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="todo-search"
              style={{ flex: 1 }}
            />
            <button className="dp-save-btn" style={{ flex: 'none', padding: '8px 16px' }}
              onClick={handleSave}
            >{editing ? 'Save' : 'Add'}</button>
            <button className="dp-cancel-btn" style={{ flex: 'none', padding: '8px 16px' }}
              onClick={() => { setEditing(null); setShowAdd(false); setForm(EMPTY_FORM); }}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="settings-cat-list">
        {categories.length === 0 && (
          <div className="mp-empty">ยังไม่มี category — กด + Add</div>
        )}
        {categories.map(cat => (
          <div key={cat.id} className="settings-cat-row">
            <span className="settings-cat-icon">{cat.icon}</span>
            <span className="settings-cat-name">{cat.name}</span>
            <div className="settings-cat-actions">
              <button className="dp-edit-btn" onClick={() => startEdit(cat)}>Edit</button>
              <button className="dp-delete-btn" onClick={() => {
                if (confirm(`ลบ "${cat.name}"?`)) onDelete(cat.id);
              }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Recurring Section ────────────────────────────────
const RecurringSection = () => {
  const { recurringTasks, fetchAll, addRecurring, editRecurring, removeRecurring } = useRecurringTaskStore();
  const [form,    setForm]    = useState(EMPTY_RECURRING);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return alert('กรุณากรอกชื่อ template');
    if (editing) {
      await editRecurring(editing.id, form);
      setEditing(null);
    } else {
      await addRecurring(form);
      setShowAdd(false);
    }
    setForm(EMPTY_RECURRING);
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      title:      t.title,
      priority:   t.priority,
      time_start: t.time_start || '',
      time_end:   t.time_end   || '',
      note:       t.note       || '',
    });
    setShowAdd(false);
  };

  return (
    <div className="mp-card">
      <div className="mp-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>🔁 Recurring Tasks</span>
        <button className="dp-add-btn" style={{ fontSize: '12px', padding: '4px 12px' }}
          onClick={() => { setShowAdd(!showAdd); setEditing(null); setForm(EMPTY_RECURRING); }}
        >+ Add</button>
      </div>

      {/* Form */}
      {(showAdd || editing) && (
        <div className="settings-form">
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Title</label>
          <input className="todo-search" placeholder="เช่น อ่านหนังสือ"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Priority</label>
          <div className="dp-toggle">
            {['low', 'medium', 'high'].map(p => (
              <button key={p}
                className={form.priority === p ? 'active' : ''}
                onClick={() => setForm({ ...form, priority: p })}
                style={form.priority === p
                  ? { background: PRIORITY_COLOR[p], borderColor: PRIORITY_COLOR[p] }
                  : {}}
              >{p}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Start</label>
              <input type="time" className="todo-search"
                value={form.time_start}
                onChange={e => setForm({ ...form, time_start: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>End</label>
              <input type="time" className="todo-search"
                value={form.time_end}
                onChange={e => setForm({ ...form, time_end: e.target.value })}
              />
            </div>
          </div>

          <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Note</label>
          <input className="todo-search" placeholder="optional"
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />

          <div className="dp-modal-actions" style={{ marginTop: '10px' }}>
            <button className="dp-cancel-btn"
              onClick={() => { setShowAdd(false); setEditing(null); setForm(EMPTY_RECURRING); }}
            >Cancel</button>
            <button className="dp-save-btn" onClick={handleSave}>
              {editing ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {recurringTasks.length === 0 && !showAdd && (
        <div className="mp-empty">ยังไม่มี template — กด + Add</div>
      )}
      {recurringTasks.map(t => (
        <div key={t.id} className="settings-cat-row">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{t.title}</span>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: PRIORITY_COLOR[t.priority], display: 'inline-block',
              }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t.time_start && `🕐 ${t.time_start}${t.time_end ? ` – ${t.time_end}` : ''}`}
              {t.note && ` · ${t.note}`}
            </div>
          </div>
          <div className="settings-cat-actions">
            <button className="dp-edit-btn" onClick={() => startEdit(t)}>Edit</button>
            <button className="dp-delete-btn" onClick={() => {
              if (confirm(`ลบ "${t.title}"?`)) removeRecurring(t.id);
            }}>Del</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Settings Page ────────────────────────────────────
const SettingsPage = () => {
  const {
    moneypadCategories, todoCategories,
    fetchAll, addCategory, editCategory, removeCategory,
  } = useCategoryStore();

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="mp-page">
      <div className="mp-nav" style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--brown)', fontSize: '18px', fontWeight: '700' }}>⚙️ Settings</h2>
      </div>

      <CategorySection
        title="💰 Moneypad Categories"
        type="moneypad"
        categories={moneypadCategories}
        onAdd={addCategory}
        onEdit={editCategory}
        onDelete={removeCategory}
      />

      <CategorySection
        title="✅ Todo Categories"
        type="todo"
        categories={todoCategories}
        onAdd={addCategory}
        onEdit={editCategory}
        onDelete={removeCategory}
      />

      <RecurringSection />
    </div>
  );
};

export default SettingsPage;