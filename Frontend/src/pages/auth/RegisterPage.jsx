import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p>Start tracking your money and tasks</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text" placeholder="Name" required
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
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
            {isLoading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;