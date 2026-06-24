import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Moderation from './pages/Moderation';
import ReportDetail from './pages/ReportDetail';
import Triage from './pages/Triage';
import Disputes from './pages/Disputes';
import DisputeDetail from './pages/DisputeDetail';
import Directory from './pages/Directory';
import UserDetail from './pages/UserDetail';
import ProviderQueue from './pages/ProviderQueue';
import Content from './pages/Content';
import PostDetail from './pages/PostDetail';
import AuditLog from './pages/AuditLog';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
        <Route path="/moderation/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
        <Route path="/moderation/triage" element={<ProtectedRoute><Triage /></ProtectedRoute>} />
        <Route path="/moderation/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
        <Route path="/moderation/dispute/:id" element={<ProtectedRoute><DisputeDetail /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
        <Route path="/directory/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
        <Route path="/directory/providers" element={<ProtectedRoute><ProviderQueue /></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
        <Route path="/content/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
