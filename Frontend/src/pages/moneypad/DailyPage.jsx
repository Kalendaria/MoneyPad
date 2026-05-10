import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDayData, createTransaction, updateTransaction, deleteTransaction } from '../../api/moneypad';
import useCategoryStore from '../../store/categoryStore';

const fmt = (n) => Number(n).toLocaleString();
const EMPTY_FORM = { type: 'expense', category: 'Food', amount: '', note: '' };

const DailyPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();

  // 1. store
  const { moneypadCategories, fetchAll } = useCategoryStore();

  // 2. state
  const [data, setData] = useState({ transactions: [], summary: { income: 0, expense: 0 } });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  // 3. functions ก่อน useEffect
  const load = async () => {
    setLoading(true);
    try { const d = await fetchDayData(date); setData(d); }
    finally { setLoading(false); }
  };

  const CATEGORIES = moneypadCategories.map(c => c.name);

  // 4. useEffect สุดท้าย
  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { load(); }, [date]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ type: t.type, category: t.category, amount: t.amount, note: t.note });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.amount || isNaN(form.amount)) return alert('กรุณากรอกจำนวนเงิน');
    const payload = { ...form, date, amount: Number(form.amount) };
    if (editing) await updateTransaction(editing.id, payload);
    else await createTransaction(payload);
    closeModal(); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบรายการนี้?')) return;
    await deleteTransaction(id); load();
  };

  // format date label
  const label = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="mp-page">

      {/* Header */}
      <div className="dp-header">
        <button className="dp-back" onClick={() => navigate('/')}>← Back</button>
        <div className="dp-title">{label}</div>
        <button className="dp-add-btn" onClick={openAdd}>+ Add</button>
      </div>

      {/* Summary */}
      <div className="mp-summary" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="mp-summary-item income">
          <span>Income</span><strong>+{fmt(data.summary.income)}</strong>
        </div>
        <div className="mp-summary-item expense">
          <span>Expense</span><strong>-{fmt(data.summary.expense)}</strong>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="mp-card">
        {loading && <div className="mp-loading">Loading...</div>}
        {!loading && data.transactions.length === 0 && (
          <div className="mp-empty">No transactions today — press + Add</div>
        )}
        {!loading && data.transactions.length > 0 && (
          <table className="dp-table">
            <thead>
              <tr>
                <th>Type</th><th>Category</th><th>Amount</th><th>Note</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map(t => (
                <tr key={t.id}>
                  <td><span className={`dp-badge ${t.type}`}>{t.type}</span></td>
                  <td>{t.category}</td>
                  <td className={`mp-tx-amt ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td className="dp-note">{t.note}</td>
                  <td>
                    <button className="dp-edit-btn" onClick={() => openEdit(t)}>Edit</button>
                    <button className="dp-delete-btn" onClick={() => handleDelete(t.id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="dp-overlay" onClick={closeModal}>
          <div className="dp-modal" onClick={e => e.stopPropagation()}>
            <div className="dp-modal-title">
              {editing ? 'Edit Transaction' : 'Add Transaction'}
            </div>

            <label>Type</label>
            <div className="dp-toggle">
              {['expense', 'income'].map(t => (
                <button key={t}
                  className={form.type === t ? 'active' : ''}
                  onClick={() => setForm({ ...form, type: t })}
                >{t}</button>
              ))}
            </div>

            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <label>Amount</label>
            <input type="number" placeholder="0" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} />

            <label>Note</label>
            <input type="text" placeholder="optional" value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })} />

            <div className="dp-modal-actions">
              <button className="dp-cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="dp-save-btn" onClick={handleSave}>
                {editing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DailyPage;