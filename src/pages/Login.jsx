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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-96">
        <h1 className="text-2xl font-semibold mb-1 text-white">Welcome back</h1>
        <p className="text-neutral-500 text-sm mb-6">Log in to PulseWatch</p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        {showResendOption && !resendSent && (
          <button type="button" onClick={handleResend} className="text-blue-400 hover:text-blue-300 text-sm mb-4 underline">
            Resend verification email
          </button>
        )}
        {resendSent && <p className="text-green-400 text-sm mb-4">Verification email sent — check your inbox.</p>}
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2.5 mb-3 outline-none focus:border-blue-500 transition"
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2.5 mb-5 outline-none focus:border-blue-500 transition"
        />
        <button className="w-full bg-blue-600 hover:bg-blue-500 transition text-white rounded-lg p-2.5 font-medium">
          Log in
        </button>
        <p className="mt-5 text-sm text-neutral-500">
          No account? <Link to="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
          {' · '}
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">Forgot password?</Link>
        </p>
      </form>
    </div>
  );
}