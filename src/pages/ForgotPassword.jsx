import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Reset password</h1>
              <p className="text-slate-400 text-sm mt-2">We&apos;ll email you a secure reset link</p>
            </div>

            <input
              type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 mb-6 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium"
            />

            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg py-2.5 font-semibold shadow-lg hover:shadow-xl transition">
              Send reset link
            </button>

            <p className="mt-6 text-sm text-slate-400">
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Back to login
              </Link>
            </p>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">✓</div>
            <p className="text-slate-300 font-medium">If an account exists for that email, a reset link has been sent.</p>
            <p className="mt-6 text-sm text-slate-400">
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
