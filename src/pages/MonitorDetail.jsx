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
      console.log('WS check received:', data);
      setRecent((prev) => [{ id: crypto.randomUUID(), ...data }, ...prev].slice(0, 20));
      setSeries((prev) => [...prev, { time: new Date(data.checkedAt).toLocaleTimeString(), ms: data.responseTimeMs }]);
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

  if (!monitor) return <div className="min-h-screen bg-neutral-950 p-8 text-neutral-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-neutral-500 hover:text-neutral-300 text-sm transition">&larr; Back to dashboard</Link>

        <div className="flex justify-between items-start mt-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">{monitor.name}</h1>
            <p className="text-neutral-500 text-sm">{monitor.url}</p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              monitor.isActive ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'
            }`}>
              {monitor.isActive ? 'Active' : 'Paused'} · every {monitor.intervalSeconds}s
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-300">
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={handleTogglePause} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-300">
              {monitor.isActive ? 'Pause' : 'Resume'}
            </button>
            <button onClick={handleDelete} className="bg-red-600/10 hover:bg-red-600/20 transition text-red-400 border border-red-600/30 rounded-lg px-3 py-1.5 text-sm font-medium">
              Delete
            </button>
          </div>
        </div>

        {editing && (
          <form onSubmit={handleUpdate} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl mb-6 space-y-3">
            <div>
              <label className="text-xs text-neutral-500">Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-2 mt-1 outline-none focus:border-blue-500 transition" />
            </div>
            <div>
              <label className="text-xs text-neutral-500">URL</label>
              <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-2 mt-1 outline-none focus:border-blue-500 transition" />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Check interval (seconds)</label>
              <input type="number" min="60" value={editInterval} onChange={(e) => setEditInterval(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-2 mt-1 outline-none focus:border-blue-500 transition" />
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 transition text-white rounded-lg px-4 py-2 font-medium text-sm">Save Changes</button>
          </form>
        )}

        {uptime && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center">
              <p className="text-2xl font-semibold text-green-400">{uptime.uptimePercentage ?? '—'}%</p>
              <p className="text-xs text-neutral-500 mt-1">Uptime (24h)</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center">
              <p className="text-2xl font-semibold text-white">{uptime.avgResponseTimeMs ?? '—'}ms</p>
              <p className="text-xs text-neutral-500 mt-1">Avg Response Time</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center">
              <p className="text-2xl font-semibold text-white">{uptime.totalChecks}</p>
              <p className="text-xs text-neutral-500 mt-1">Total Checks</p>
            </div>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl mb-6">
          <h2 className="text-sm font-medium text-neutral-300 mb-4">Response Time (last 24h)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series}>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#a3a3a3' }}
              />
              <Line type="monotone" dataKey="ms" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <h2 className="text-sm font-medium text-neutral-300 mb-3">Recent Checks</h2>
          <div className="space-y-0.5">
            {recent.map((c) => (
              <div key={c.id} className="flex justify-between text-sm py-2 border-b border-neutral-800 last:border-0">
                <span className="text-neutral-500">{new Date(c.checkedAt).toLocaleString()}</span>
                <span className={c.success ? 'text-green-400' : 'text-red-400'}>
                  {c.success ? `OK · ${c.responseTimeMs}ms` : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}