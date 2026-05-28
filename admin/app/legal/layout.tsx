import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px 96px' }}>
      <Link href="/legal/privacy" className="label" style={{ color: 'var(--color-deep-ocean)', textDecoration: 'none', marginRight: 24 }}>
        Privacy
      </Link>
      <Link href="/legal/terms" className="label" style={{ color: 'var(--color-deep-ocean)', textDecoration: 'none', marginRight: 24 }}>
        Terms
      </Link>
      <Link href="/legal/account-deletion" className="label" style={{ color: 'var(--color-deep-ocean)', textDecoration: 'none' }}>
        Account deletion
      </Link>
      <hr />
      {children}
      <hr />
      <p style={{ fontSize: 13, opacity: 0.6 }}>
        Canine Society · Roma · DACH. Contact: hello@canine-society.com
      </p>
    </main>
  );
}
