import { Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Projects from './pages/Projects';
import SubProjects from './pages/SubProjects';
import Counterparties from './pages/Counterparties';
import Products from './pages/Products';
import Services from './pages/Services';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { PrefsProvider } from './context/PrefsContext';

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-6">Завантаження…</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

function Shell() {
  return (
    <div className="page-container flex">
      <Sidebar />
      <div className="flex-1 min-h-screen min-w-0">
        <Topbar />
        <div className="p-6 min-w-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/projects" element={<Protected><Projects /></Protected>} />
            <Route path="/subprojects" element={<Protected><SubProjects /></Protected>} />
            <Route path="/counterparties" element={<Protected><Counterparties /></Protected>} />
            <Route path="/products" element={<Protected><Products /></Protected>} />
            <Route path="/services" element={<Protected><Services /></Protected>} />
            <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
            <Route path="/settings" element={<Protected><Settings /></Protected>} />
            <Route path="*" element={<div className="text-center mt-20">404 • <Link className="underline" to="/dashboard">На дашборд</Link></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PrefsProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Shell />} />
        </Routes>
      </PrefsProvider>
    </AuthProvider>
  );
}
