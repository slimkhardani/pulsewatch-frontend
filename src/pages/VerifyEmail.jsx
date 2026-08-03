import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }

    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center">
        {status === 'verifying' && (
          <>
            <div className="mb-4 text-4xl">⏳</div>
            <p className="text-slate-300 font-medium">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 text-5xl text-green-400">✓</div>
            <p className="text-green-300 font-semibold mb-6">Email verified successfully!</p>
            <Link to="/login" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl transition">
              Continue to login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 text-5xl text-red-400">✕</div>
            <p className="text-red-300 font-semibold mb-6">Invalid or expired verification link</p>
            <Link to="/login" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl transition">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
