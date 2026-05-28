'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REJECT_REASONS = [
  { value: 'no_dog', label: 'No dog visible in any photo' },
  { value: 'inappropriate_photo', label: 'Inappropriate photo' },
  { value: 'fake_profile', label: 'Looks fake or stock' },
  { value: 'underage', label: 'Appears underage' },
  { value: 'other', label: 'Other (see note)' },
];

type Mode = 'idle' | 'rejecting' | 'revising';

export function Actions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('idle');
  const [reason, setReason] = useState<string>('no_dog');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const post = async (path: string, body: object) => {
    setBusy(true);
    setErr(null);
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      setErr(await res.text());
      return false;
    }
    return true;
  };

  const approve = async () => {
    const ok = await post('/api/moderation/approve', { profileId });
    if (ok) router.push('/queue');
  };

  const reject = async () => {
    const ok = await post('/api/moderation/reject', { profileId, reason, note });
    if (ok) router.push('/queue');
  };

  const revise = async () => {
    const ok = await post('/api/moderation/revise', { profileId, note });
    if (ok) router.push('/queue');
  };

  if (mode === 'rejecting') {
    return (
      <section>
        <div className="label">Reject — pick a reason</div>
        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          {REJECT_REASONS.map((r) => (
            <label key={r.value} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
        <div style={{ height: 24 }} />
        <label className="label" htmlFor="note">Note for the member (optional)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ marginTop: 8 }}
        />
        <div style={{ height: 24 }} />
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn-danger" onClick={reject} disabled={busy}>
            {busy ? 'Sending…' : 'Confirm reject'}
          </button>
          <button className="btn-ghost" onClick={() => setMode('idle')} disabled={busy}>
            Cancel
          </button>
        </div>
        {err && <p style={{ color: 'var(--color-mud)', marginTop: 16 }}>{err}</p>}
      </section>
    );
  }

  if (mode === 'revising') {
    return (
      <section>
        <div className="label">Request revision</div>
        <p style={{ marginTop: 8 }}>
          The member will be notified to update their profile and resubmit.
        </p>
        <label className="label" htmlFor="note">What needs to change</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ marginTop: 8 }}
          autoFocus
        />
        <div style={{ height: 24 }} />
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn-primary" onClick={revise} disabled={busy || !note.trim()}>
            {busy ? 'Sending…' : 'Send revision request'}
          </button>
          <button className="btn-ghost" onClick={() => setMode('idle')} disabled={busy}>
            Cancel
          </button>
        </div>
        {err && <p style={{ color: 'var(--color-mud)', marginTop: 16 }}>{err}</p>}
      </section>
    );
  }

  return (
    <section>
      <div className="label">Decision</div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={approve} disabled={busy}>
          {busy ? '…' : 'Approve'}
        </button>
        <button className="btn-ghost" onClick={() => setMode('revising')} disabled={busy}>
          Request revision
        </button>
        <button className="btn-danger" onClick={() => setMode('rejecting')} disabled={busy}>
          Reject
        </button>
      </div>
      {err && <p style={{ color: 'var(--color-mud)', marginTop: 16 }}>{err}</p>}
    </section>
  );
}
