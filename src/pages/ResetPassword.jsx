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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-96">
        {!success ? (
          <form onSubmit={handleSubmit}>
            <h1 className="text-2xl font-semibold mb-1 text-white">Set new password</h1>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <input
              type="password" placeholder="New password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2.5 mb-4 outline-none focus:border-blue-500 transition"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 transition text-white rounded-lg p-2.5 font-medium">
              Reset password
            </button>
          </form>
        ) : (
          <p className="text-green-400 text-sm">Password reset! Redirecting to login...</p>
        )}
      </div>
    </div>
  );
}