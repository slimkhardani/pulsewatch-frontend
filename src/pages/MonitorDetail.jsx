import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';
import socket from '../api/socket';

export default function MonitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [series, setSeries] = useState([]);
  const [recent, setRecent] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editInterval, setEditInterval] = useState(60);

  const loadMonitor = async () => {
    const res = await api.get(`/monitors/${id}`);
    setMonitor(res.data);
    setEditName(res.data.name);
    setEditUrl(res.data.url);
    setEditInterval(res.data.intervalSeconds);
  };

  const loadStats = () => {
    api.get(`/monitors/${id}/stats/uptime?hours=24`).then((res) => setUptime(res.data));
    api.get(`/monitors/${id}/stats/response-time?hours=24`).then((res) => {
      const formatted = res.data.map((c) => ({
        time: new Date(c.checkedAt).toLocaleTimeString(),
        ms: c.responseTimeMs,
      }));
      setSeries(formatted);
    });
    api.get(`/monitors/${id}/stats/recent-checks`).then((res) => setRecent(res.data));
  };

  useEffect(() => {
    loadMonitor();
    loadStats();
  }, [id]);

  useEffect(() => {
    socket.connect();
    const checkHandler = (data) => {
      setRecent((prev) => [{ id: crypto.randomUUID(), ...data }, ...prev].slice(0, 20));
      setSeries((prev) => [...prev, { time: new Date(data.checkedAt).toLocaleTimeString(), ms: data.responseTimeMs }]);
      api.get(`/monitors/${id}/stats/uptime?hours=24`).then((res) => setUptime(res.data));
    };
    const incidentHandler = () => loadMonitor();
    socket.on(`monitor:${id}:check`, checkHandler);
    socket.on(`monitor:${id}:incident`, incidentHandler);
    return () => {
      socket.off(`monitor:${id}:check`, checkHandler);
      socket.off(`monitor:${id}:incident`, incidentHandler);
      socket.disconnect();
    };
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.patch(`/monitors/${id}`, { name: editName, url: editUrl, intervalSeconds: Number(editInterval) });
    setEditing(false);
    loadMonitor();
  };

  const handleTogglePause = async () => {
    await api.patch(`/monitors/${id}`, { isActive: !monitor.isActive });
    loadMonitor();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${monitor.name}"? This cannot be undone.`)) return;
    await api.delete(`/monitors/${id}`);
    navigate('/dashboard');
  };

  if (!monitor) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
      <p className="text-slate-400 font-medium">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link to="/dashboard" className="text-slate-400 hover:text-slate-200 text-sm font-medium transition inline-flex items-center mb-8">
          <span className="mr-2">←</span> Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{monitor.name}</h1>
            <p className="text-slate-400 text-sm mb-3 truncate">{monitor.url}</p>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${
              monitor.isActive ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
            }`}>
              <span className={monitor.isActive ? 'text-green-400' : 'text-slate-500'}>●</span>
              {monitor.isActive ? 'Active' : 'Paused'} · every {monitor.intervalSeconds}s
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => setEditing(!editing)} 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/70 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 transition"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button 
              onClick={handleTogglePause} 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/70 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 transition"
            >
              {monitor.isActive ? 'Pause' : 'Resume'}
            </button>
            <button 
              onClick={handleDelete} 
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-300 transition"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleUpdate} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl mb-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Monitor name</label>
              <input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">URL</label>
              <input 
                value={editUrl} 
                onChange={(e) => setEditUrl(e.target.value)} 
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Check interval (seconds)</label>
              <input 
                type="number" min="60" 
                value={editInterval} 
                onChange={(e) => setEditInterval(e.target.value)} 
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium" 
              />
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl transition">
              Save Changes
            </button>
          </form>
        )}

        {/* Stats Grid */}
        {uptime && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold text-green-400">{uptime.uptimePercentage ?? '—'}%</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Uptime (24h)</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold text-white">{uptime.avgResponseTimeMs ?? '—'}ms</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Avg Response Time</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl text-center">
              <p className="text-4xl font-bold text-blue-400">{uptime.totalChecks}</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Total Checks</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Response Time (last 24h)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid stroke="#475569" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line type="monotone" dataKey="ms" stroke="#60a5fa" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Checks */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Checks</h2>
          <div className="space-y-0">
            {recent.map((c, idx) => (
              <div 
                key={c.id} 
                className={`flex justify-between items-center py-3 px-3 ${idx !== recent.length - 1 ? 'border-b border-slate-700/50' : ''}`}
              >
                <span className="text-slate-400 text-sm font-medium">{new Date(c.checkedAt).toLocaleString()}</span>
                <span className={`text-sm font-semibold ${c.success ? 'text-green-400' : 'text-red-400'}`}>
                  {c.success ? `✓ OK · ${c.responseTimeMs}ms` : '✕ FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
