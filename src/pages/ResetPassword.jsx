import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/reset-password', {
        token: searchParams.get('token'),
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed — link may be expired');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Set new password</h1>
              <p className="text-slate-400 text-sm mt-2">Create a strong password for your account</p>
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">
                {error}
              </div>
            )}

            <input
              type="password" placeholder="New password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 mb-6 outline-none focus:border-blue-500 focus:bg-slate-700/80 transition font-medium"
            />

            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg py-2.5 font-semibold shadow-lg hover:shadow-xl transition">
              Reset password
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">✓</div>
            <p className="text-green-300 font-semibold">Password reset successfully!</p>
            <p className="text-slate-400 text-sm mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
