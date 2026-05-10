import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const NAV = [
  { icon: '💰', label: 'Moneypad', path: '/' },
  { icon: '✅', label: 'Todo', path: '/todo' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const NAV = [
    { icon: '💰', label: 'Moneypad', path: '/' },
    { icon: '✅', label: 'Todo', path: '/todo' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' || location.pathname.startsWith('/daily')
      : location.pathname.startsWith(path);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '›' : '‹'}
      </button>

      {/* Logo */}
      <div className="sidebar-logo">
        {collapsed ? 'M' : 'MP'}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(n => (
          <button key={n.path}
            className={`sidebar-btn ${isActive(n.path) ? 'active' : ''}`}
            onClick={() => navigate(n.path)}
            title={collapsed ? n.label : ''}
          >
            <span className="sidebar-icon">{n.icon}</span>
            {!collapsed && <span className="sidebar-label">{n.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && <div className="sidebar-user">{user?.name}</div>}
        <button className="sidebar-logout" onClick={logout} title={collapsed ? 'Logout' : ''}>
          {collapsed ? '↩' : 'Logout'}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;