import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSent(false);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleResend = async () => {
    await api.post('/auth/resend-verification', { email });
    setResendSent(true);
  };

  const showResendOption = error.toLowerCase().includes('verify');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your PulseWatch account</p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        {showResendOption && !resendSent && (
          <button type="button" onClick={handleResend} className="text-blue-400 hover:text-blue-300 text-sm mb-4 underline font-medium">
            Resend verification email
          </button>
        )}

        {resendSent && (
          <div className="bg-green-500/15 border border-green-500/40 text-green-300 p-3 rounded-lg mb-4 text-sm font-medium">
            ✓ Verification email sent — check your inbox
          </div>
        )}

        <div className="space-y-3 mb-6">
          <input
            type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium"
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium"
          />
        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg py-2.5 font-semibold shadow-lg hover:shadow-xl transition">
          Sign in
        </button>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-slate-400">
            No account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Create one
            </Link>
          </p>
          <p className="text-sm text-slate-400">
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-semibold">
              Forgot password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
