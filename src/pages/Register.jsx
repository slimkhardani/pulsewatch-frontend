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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-96">
        {!registered ? (
          <form onSubmit={handleSubmit}>
            <h1 className="text-2xl font-semibold mb-1 text-white">Create your account</h1>
            <p className="text-neutral-500 text-sm mb-6">Start monitoring in seconds</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2.5 mb-3 outline-none focus:border-blue-500 transition"
            />
            <input
              type="password" placeholder="Password (min 8 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2.5 mb-5 outline-none focus:border-blue-500 transition"
            />
            <button
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 transition text-white rounded-lg p-2.5 font-medium disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Register'}
            </button>
            <p className="mt-5 text-sm text-neutral-500">
              Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
            </p>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-400 mb-2">✓ {message}</p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">Go to login</Link>
          </div>
        )}
      </div>
    </div>
  );
}