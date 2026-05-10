import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MonthlyPage from './pages/moneypad/MonthlyPage';
import DailyPage from './pages/moneypad/DailyPage';
import AppLayout from './components/shared/AppLayout';
import WeeklyPage from './pages/todo/WeeklyPage';
import TodoDailyPage from './pages/todo/TodoDailyPage';
import SettingsPage from './pages/SettingsPage';

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><MonthlyPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/daily/:date" element={
          <ProtectedRoute>
            <AppLayout><DailyPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/todo" element={
          <ProtectedRoute>
            <AppLayout><WeeklyPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/todo/daily/:date" element={
          <ProtectedRoute>
            <AppLayout><TodoDailyPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout><SettingsPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;