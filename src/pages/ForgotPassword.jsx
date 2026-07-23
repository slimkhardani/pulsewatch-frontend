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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-96">
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <h1 className="text-2xl font-semibold mb-1 text-white">Reset password</h1>
            <p className="text-neutral-500 text-sm mb-6">We'll email you a reset link</p>
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg p-2.5 mb-4 outline-none focus:border-blue-500 transition"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 transition text-white rounded-lg p-2.5 font-medium">
              Send reset link
            </button>
          </form>
        ) : (
          <p className="text-neutral-300 text-sm">If an account exists for that email, a reset link has been sent.</p>
        )}
        <p className="mt-5 text-sm text-neutral-500">
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to login</Link>
        </p>
      </div>
    </div>
  );
}