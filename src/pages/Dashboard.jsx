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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              PulseWatch
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time uptime monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm transition ${
                user.plan === 'pro'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-700/40 text-slate-300 border-slate-600/40'
              }`}>
                {user.plan === 'pro' ? '✨ Pro' : '●  Free'} · {monitors.length}/{user.plan === 'pro' ? 50 : 5}
              </div>
            )}
            {user?.plan === 'free' && (
              <button onClick={handleUpgrade} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition">
                Upgrade
              </button>
            )}
            {user?.plan === 'pro' && (
              <button onClick={handleCancelSubscription} className="text-slate-400 hover:text-red-400 transition text-sm font-medium">
                Cancel Plan
              </button>
            )}
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-200 transition text-sm font-medium">
              Log out
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {searchParams.get('upgraded') === 'true' && (
          <div className="bg-green-500/15 border border-green-500/40 text-green-300 p-4 rounded-lg mb-6 text-sm font-medium backdrop-blur-sm">
            ✓ Payment successful — your plan updated.
          </div>
        )}

        {/* Add Monitor Form */}
        <form onSubmit={handleAdd} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-xl mb-8 flex gap-3 shadow-lg">
          <input
            placeholder="Monitor name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 flex-1 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition text-sm font-medium"
          />
          <input
            placeholder="https://example.com" value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 flex-1 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition text-sm font-medium"
          />
          <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-6 text-sm font-semibold shadow-lg hover:shadow-xl transition whitespace-nowrap">
            Add Monitor
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-4 rounded-lg mb-6 text-sm font-medium flex justify-between items-center backdrop-blur-sm">
            <span>{error}</span>
            {error.includes('limit') && (
              <button onClick={handleUpgrade} className="text-red-300 underline font-semibold hover:text-red-200">
                Upgrade now
              </button>
            )}
          </div>
        )}

        {/* Monitors Grid */}
        <div className="space-y-3">
          {monitors.map((m) => (
            <Link key={m.id} to={`/monitors/${m.id}`}>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-5 rounded-xl flex justify-between items-center hover:bg-slate-800/60 hover:border-slate-600/70 transition group shadow-md hover:shadow-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-lg truncate">{m.name}</p>
                  <p className="text-sm text-slate-400 truncate">{m.url}</p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    m.isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-700/40 text-slate-400 border border-slate-600/30'
                  }`}>
                    {m.isActive ? '● Active' : '○ Paused'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!confirm(`Delete "${m.name}"?`)) return;
                      api.delete(`/monitors/${m.id}`).then(() => loadMonitors());
                    }}
                    className="text-slate-500 hover:text-red-400 transition text-sm font-medium opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Link>
          ))}
          {monitors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-base font-medium">No monitors yet</p>
              <p className="text-slate-600 text-sm">Add your first monitor above to start tracking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
