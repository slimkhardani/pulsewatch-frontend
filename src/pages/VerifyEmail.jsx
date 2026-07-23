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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-96 text-center">
        {status === 'verifying' && <p className="text-neutral-400">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-400 mb-4">✓ Email verified successfully!</p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Continue to login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-400 mb-4">Invalid or expired verification link.</p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}