import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Moneypad</h1>
        <p>Sign in to your account</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email" placeholder="Email" required
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <input
            type="password" placeholder="Password" required
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p>Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;