import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMoneypadStore from '../../store/moneypadStore';
import useAuthStore from '../../store/authStore';

// ── helpers ──────────────────────────────────────
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Health', 'Entertainment', 'Other'];
const ALERT_THRESHOLD = 0.8;
const fmt = (n) => Number(n).toLocaleString();

const heatColor = (net) => {
    if (!net) return 'transparent';
    const intensity = Math.min(Math.abs(net) / 1000, 1); //
    const opacity = 0.15 + intensity * 0.55;
    if (net > 0) return `rgba(22, 163, 74, ${opacity})`;
    return `rgba(220, 38, 38, ${opacity})`;
};

const buildCalendar = (month) => {
    const [y, m] = month.split('-').map(Number);
    const firstDay = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return { cells, y, m };
};

// ── component ─────────────────────────────────────
const MonthlyPage = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const {
        selectedMonth, summary, dailyNet, transactions, budgets, isLoading,
        fetchMonth, prevMonth, nextMonth, goToday, saveBudget,
    } = useMoneypadStore();

    useEffect(() => { fetchMonth(selectedMonth); }, [selectedMonth]);

    const { cells, y, m } = buildCalendar(selectedMonth);
    const todayStr = new Date().toISOString().slice(0, 10);
    const recent = [...transactions]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5)

    const goDay = (day) => {
        if (!day) return;
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        navigate(`/daily/${dateStr}`);
    };

    const [budgetModal, setBudgetModal] = useState(false);
    const [budgetForm, setBudgetForm] = useState({});

    const openBudgetModal = () => {
        const map = {};
        budgets.forEach(b => { map[b.category] = b.limit_amount; });
        setBudgetForm(map);
        setBudgetModal(true);
    };

    const saveBudgets = async () => {
        for (const [category, limit] of Object.entries(budgetForm)) {
            if (limit) await saveBudget(category, Number(limit));
        }
        setBudgetModal(false);
    };
    const budgetMap = {};
    budgets.forEach(b => { budgetMap[b.category] = b.limit_amount; });

    const expenseByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

    const alerts = budgets.filter(b => {
        const used = expenseByCategory[b.category] || 0;
        return used / b.limit_amount >= ALERT_THRESHOLD;
    }).map(b => {
        const used = expenseByCategory[b.category] || 0;
        const pct = Math.round(used / b.limit_amount * 100);
        const over = used > b.limit_amount;
        return { category: b.category, used, limit: b.limit_amount, pct, over };
    });
    return (
        <div className="mp-page">

            {/* Month Navigator */}
            <div className="mp-nav">
                <button onClick={prevMonth}>‹</button>
                <span className="mp-month-label">{MONTH_NAMES[m - 1]} {y}</span>
                <button onClick={goToday} className="mp-today-btn">Today</button>
                <button onClick={nextMonth}>›</button>
            </div>

            {/* Summary */}
            <div className="mp-summary">
                <div className="mp-summary-item income">
                    <span>Income</span>
                    <strong>+{fmt(summary.income)}</strong>
                </div>
                <div className="mp-summary-item expense">
                    <span>Expense</span>
                    <strong>-{fmt(summary.expense)}</strong>
                </div>
                <div className="mp-summary-item balance">
                    <span>Balance</span>
                    <strong>{fmt(summary.balance)}</strong>
                </div>
            </div>

            {/* Budget Status */}
            <div className="mp-card">
                <div className="mp-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🎯 Budget Status</span>
                    <button className="mp-btn-ghost" style={{ fontSize: '12px' }} onClick={openBudgetModal}>
                        ⚙️ Set Budget
                    </button>
                </div>
                {budgets.length === 0 && (
                    <div className="mp-empty">No budget set — click ⚙️ Set Budget</div>
                )}
                {budgets.map(b => {
                    const used = expenseByCategory[b.category] || 0;
                    const pct = Math.min(Math.round(used / b.limit_amount * 100), 100);
                    const color = pct >= 100 ? '#dc2626' : pct >= 80 ? '#f59e0b' : '#16a34a';
                    return (
                        <div key={b.category} className="mp-budget-row">
                            <div className="mp-budget-label">
                                <span>{b.category}</span>
                                <span style={{ color: '#888', fontSize: '12px' }}>
                                    {fmt(used)} / {fmt(b.limit_amount)}
                                </span>
                            </div>
                            <div className="mp-budget-bar-bg">
                                <div className="mp-budget-bar" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="mp-budget-pct" style={{ color }}>{pct}%</span>
                        </div>
                    );
                })}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="mp-card mp-alerts">
                    <div className="mp-section-title">⚠️ Alerts</div>
                    {alerts.map(a => (
                        <div key={a.category} className={`mp-alert-row ${a.over ? 'over' : 'near'}`}>
                            {a.over
                                ? `❌ ${a.category} เกินงบแล้ว! (${a.pct}%)`
                                : `⚠️ ${a.category} ใกล้ถึงงบแล้ว (${a.pct}%)`
                            }
                        </div>
                    ))}
                </div>
            )}

            {/* Calendar Heatmap */}
            <div className="mp-card">
                <div className="mp-section-title">📅 Calendar</div>
                <div className="mp-cal-grid mp-cal-head">
                    {DAYS.map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="mp-cal-grid">
                    {cells.map((day, i) => {
                        if (!day) return <div key={`e${i}`} className="mp-cal-cell empty" />;
                        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const net = dailyNet[dateStr] || 0;
                        const isToday = dateStr === todayStr;
                        return (
                            <div key={day}
                                className={`mp-cal-cell${isToday ? ' today' : ''}`}
                                style={{ background: heatColor(net) }}
                                onClick={() => goDay(day)}
                            >
                                <div className="mp-cal-day">{day}</div>
                                {net !== 0 && (
                                    <div className="mp-cal-amt">
                                        {net > 0 ? '+' : ''}{fmt(Math.round(net))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="mp-card">
                <div className="mp-section-title">🔍 Recent Transactions</div>
                {isLoading && <div className="mp-loading">Loading...</div>}
                {!isLoading && recent.length === 0 && (
                    <div className="mp-empty">No transactions this month</div>
                )}
                {recent.map(t => (
                    <div key={t.id} className="mp-tx-row">
                        <div className="mp-tx-left">
                            <span className="mp-tx-cat">{t.category}</span>
                            <span className="mp-tx-note">{t.note}</span>
                        </div>
                        <div className={`mp-tx-amt ${t.type}`}>
                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Budget Modal */}
            {budgetModal && (
                <div className="dp-overlay" onClick={() => setBudgetModal(false)}>
                    <div className="dp-modal" onClick={e => e.stopPropagation()}>
                        <div className="dp-modal-title">⚙️ ตั้งงบประมาณ</div>
                        {CATEGORIES.map(c => (
                            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ width: '120px', fontSize: '13px' }}>{c}</label>
                                <input type="number" placeholder="0 = No Limit"
                                    value={budgetForm[c] || ''}
                                    onChange={e => setBudgetForm({ ...budgetForm, [c]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div className="dp-modal-actions">
                            <button className="dp-cancel-btn" onClick={() => setBudgetModal(false)}>Cancel</button>
                            <button className="dp-save-btn" onClick={saveBudgets}>Save</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MonthlyPage;