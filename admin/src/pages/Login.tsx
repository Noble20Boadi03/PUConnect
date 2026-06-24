import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getAdminSections } from '../hooks/useAdminPermissions';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authService.login(emailOrUsername.trim(), password);

      if (!user.adminTier) {
        setError('This account does not have admin access');
        setLoading(false);
        return;
      }

      login(token, user);

      const sections = getAdminSections(user.adminTier);
      const firstSection = sections[0];

      if (firstSection === 'dashboard') {
        navigate('/dashboard');
      } else if (firstSection === 'moderation') {
        navigate('/moderation');
      } else if (firstSection === 'directory') {
        navigate('/directory');
      } else if (firstSection === 'content') {
        navigate('/content');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-brand-600 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-8">
            <span className="text-xl font-bold">PU</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">PUConnect Admin</h1>
          <p className="text-brand-200 text-lg leading-relaxed">
            Manage users, moderate content, and keep the platform running smoothly.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {['Dashboard Analytics', 'Moderation Tools', 'User Directory', 'Audit Logging'].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-brand-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  {feature}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center bg-surface-muted p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-800 flex items-center justify-center">
              <img src="/logo.png" alt="PUConnect Logo" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PUConnect Admin</h1>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your admin account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email or username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>
              )}
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
