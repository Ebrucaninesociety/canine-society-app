export default function NoAccess() {
  return (
    <main style={{ maxWidth: 480, margin: '12vh auto', padding: '0 32px' }}>
      <div className="label">A note</div>
      <h1 style={{ fontSize: 48, lineHeight: 1, marginTop: 8 }}>Not a moderator</h1>
      <hr />
      <p>
        Your account is authenticated but is not on the moderator list. Ask another moderator to add you, or sign
        out and try again.
      </p>
      <div style={{ height: 24 }} />
      <a href="/login" className="btn-ghost">Sign out</a>
    </main>
  );
}
