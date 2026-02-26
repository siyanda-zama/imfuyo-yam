'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface AuthFormProps {
  mode?: 'login' | 'register';
  loginOnly?: boolean;
}

function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full rounded-xl bg-background px-4 pt-5 pb-2 min-h-[56px] text-white outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
      />
      <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs">
        {label}
      </label>
    </div>
  );
}

export default function AuthForm({ mode: initialMode = 'login', loginOnly = false }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const isAdminLogin = loginOnly || callbackUrl.includes('/admin');

  const [mode, setMode] = useState<'login' | 'register'>(isAdminLogin ? 'login' : initialMode);
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

    // Fetch session to check role and redirect accordingly
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
        return;
      }
    } catch {
      // Fall through to default redirect
    }

    // If this was an admin login attempt but user is not admin
    if (isAdminLogin) {
      setError('Access denied. Admin credentials required.');
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
      {/* Tab Switcher — hidden for admin login */}
      {!isAdminLogin ? (
        <div className="relative flex mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 pb-3 text-center font-semibold transition-colors relative z-10 ${
              mode === 'login' ? 'text-primary' : 'text-secondary'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 pb-3 text-center font-semibold transition-colors relative z-10 ${
              mode === 'register' ? 'text-primary' : 'text-secondary'
            }`}
          >
            Register
          </button>
          {/* Sliding indicator */}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full"
            style={{ width: '50%' }}
            animate={{ left: mode === 'login' ? '0%' : '50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-center font-bold text-lg text-white">Admin Login</h2>
          <p className="text-center text-xs text-text-muted mt-1">Department of Agriculture, Land Reform</p>
          <div className="mt-4 h-px bg-border" />
        </div>
      )}

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {mode === 'register' && !isAdminLogin && (
          <FloatingInput
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <FloatingInput
          label="Phone Number (e.g. 0712345678)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <FloatingInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mode === 'login' && !isAdminLogin && (
          <p className="text-right text-sm text-secondary -mt-2">
            Forgot password?
          </p>
        )}

        {error && (
          <p className="text-danger text-sm text-center">{error}</p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="bg-primary text-background rounded-xl p-4 w-full font-bold min-h-[56px] disabled:opacity-60 transition-all"
          whileTap={{ scale: 0.98 }}
        >
          {loading
            ? 'Signing in...'
            : (isAdminLogin ? 'Sign In to Admin' : (mode === 'login' ? 'Sign In' : 'Create Account'))}
        </motion.button>
      </motion.form>
    </div>
  );
}
