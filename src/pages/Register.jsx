import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { email, password });
      setMessage(res.data.message);
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
        {!registered ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Create account</h1>
              <p className="text-slate-400 text-sm mt-2">Start monitoring in seconds</p>
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <input
                type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium"
              />
              <input
                type="password" placeholder="Password (min 8 chars)" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium"
              />
            </div>

            <button
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg py-2.5 font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Register'}
            </button>

            <p className="mt-6 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">✓</div>
            <p className="text-green-300 font-semibold mb-2">{message}</p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Continue to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
