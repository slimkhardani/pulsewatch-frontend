import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function Dashboard() {
  const [monitors, setMonitors] = useState([]);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loadMonitors = async () => {
    const res = await api.get('/monitors');
    setMonitors(res.data);
  };

  const loadUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data);
  };

  useEffect(() => {
    loadMonitors();
    loadUser();
    if (searchParams.get('upgraded') === 'true') {
      setTimeout(() => loadUser(), 2000);
    }
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/monitors', { name, url, intervalSeconds: 60 });
      setName(''); setUrl('');
      loadMonitors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add monitor');
    }
  };

  const handleUpgrade = async () => {
    const res = await api.post('/billing/checkout');
    window.location.href = res.data.url;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCancelSubscription = async () => {
  if (!confirm('Cancel your Pro subscription? You will be downgraded to Free.')) return;
  await api.post('/billing/cancel');
  alert('Subscription cancelled. Your plan will update shortly.');
  setTimeout(() => loadUser(), 2000);
};

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">PulseWatch</h1>
          <div className="flex items-center gap-3">
            {user && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                user.plan === 'pro'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}>
                {user.plan === 'pro' ? '⭐ Pro' : 'Free'} · {monitors.length}/{user.plan === 'pro' ? 50 : 5}
              </span>
            )}
            {user?.plan === 'free' && (
              <button onClick={handleUpgrade} className="bg-purple-600 hover:bg-purple-500 transition text-white rounded-lg px-3 py-1.5 text-sm font-medium">
                Upgrade
              </button>
            )}

            {user?.plan === 'pro' && (
  <button onClick={handleCancelSubscription} className="text-sm text-neutral-500 hover:text-red-400 transition">
    Cancel Plan
  </button>
)}
            <button onClick={handleLogout} className="text-sm text-neutral-500 hover:text-neutral-300 transition">
              Log out
            </button>
          </div>
        </div>

        {searchParams.get('upgraded') === 'true' && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-3 rounded-lg mb-4 text-sm">
            Payment successful — your plan will update shortly.
          </div>
        )}

        <form onSubmit={handleAdd} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl mb-3 flex gap-2">
          <input
            placeholder="Monitor name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2 flex-1 outline-none focus:border-blue-500 transition text-sm"
          />
          <input
            placeholder="https://example.com" value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2 flex-1 outline-none focus:border-blue-500 transition text-sm"
          />
          <button className="bg-blue-600 hover:bg-blue-500 transition text-white rounded-lg px-4 text-sm font-medium">
            Add
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
            <span>{error}</span>
            {error.includes('limit') && (
              <button onClick={handleUpgrade} className="text-red-300 underline font-medium">
                Upgrade now
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {monitors.map((m) => (
            <div key={m.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex justify-between items-center hover:border-neutral-700 transition group">
              <Link to={`/monitors/${m.id}`} className="flex-1">
                <p className="font-medium text-white">{m.name}</p>
                <p className="text-sm text-neutral-500">{m.url}</p>
              </Link>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  m.isActive ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {m.isActive ? 'Active' : 'Paused'}
                </span>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!confirm(`Delete "${m.name}"?`)) return;
                    await api.delete(`/monitors/${m.id}`);
                    loadMonitors();
                  }}
                  className="text-neutral-600 hover:text-red-400 transition text-sm opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {monitors.length === 0 && (
            <p className="text-neutral-600 text-center py-12 text-sm">No monitors yet — add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}