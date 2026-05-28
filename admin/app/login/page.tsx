'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sendCode = async () => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setStep('code');
  };

  const verify = async () => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push('/queue');
    router.refresh();
  };

  return (
    <main style={{ maxWidth: 480, margin: '12vh auto', padding: '0 32px' }}>
      <div className="label" style={{ marginBottom: 8 }}>Roma · Moderation</div>
      <h1 style={{ fontSize: 48, lineHeight: 1 }}>Sign in</h1>
      <hr />
      {step === 'email' ? (
        <>
          <label className="label" htmlFor="email">Your email</label>
          <input
            id="email"
            type="email"
            placeholder="you@canine-society.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <div style={{ height: 32 }} />
          <button
            className="btn-primary"
            onClick={sendCode}
            disabled={busy || email.length < 5}
          >
            {busy ? 'Sending…' : 'Send Code'}
          </button>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 24 }}>
            We sent a six-digit code to <strong>{email}</strong>.
          </p>
          <label className="label" htmlFor="code">Code</label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={8}
            placeholder="00000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ fontSize: 28, letterSpacing: 6, textAlign: 'center' }}
            autoFocus
          />
          <div style={{ height: 32 }} />
          <button
            className="btn-primary"
            onClick={verify}
            disabled={busy || code.length < 6}
          >
            {busy ? 'Verifying…' : 'Verify'}
          </button>
          <div style={{ height: 16 }} />
          <button className="btn-ghost" onClick={() => setStep('email')}>
            Use a different email
          </button>
        </>
      )}
      {err && (
        <p style={{ color: 'var(--color-mud)', marginTop: 24, fontSize: 14 }}>{err}</p>
      )}
    </main>
  );
}
