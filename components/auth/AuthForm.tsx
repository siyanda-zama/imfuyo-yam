'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode?: 'login' | 'register';
}

export default function AuthForm({ mode: initialMode = 'login' }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid phone number or password.');
      setLoading(false);
      return;
    }

    router.push('/');
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError('Registration succeeded but login failed. Please log in manually.');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex mb-6">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          className={`flex-1 pb-3 text-center font-semibold transition-colors ${
            mode === 'login'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setError(''); }}
          className={`flex-1 pb-3 text-center font-semibold transition-colors ${
            mode === 'register'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted'
          }`}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-xl bg-surface p-4 min-h-[44px] outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        <input
          type="tel"
          placeholder="Phone Number (e.g. 0712345678)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="rounded-xl bg-surface p-4 min-h-[44px] outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-xl bg-surface p-4 min-h-[44px] outline-none focus:ring-2 focus:ring-primary"
        />

        {error && (
          <p className="text-alert-red text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded-xl p-4 w-full font-semibold min-h-[44px] disabled:opacity-60 transition-opacity"
        >
          {loading
            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
            : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
      </form>
    </div>
  );
}
