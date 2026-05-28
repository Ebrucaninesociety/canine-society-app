export const metadata = { title: 'Account deletion · Canine Society' };

export default function AccountDeletionPage() {
  return (
    <article>
      <div className="label">Document</div>
      <h1 style={{ fontSize: 48, lineHeight: 1, marginTop: 8 }}>Account deletion</h1>

      <p>
        You can delete your Canine Society account at any time from inside the application.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>How to delete in the app</h2>
      <ol>
        <li>Open Canine Society on your iPhone or Android device.</li>
        <li>Tap the <strong>Society</strong> tab (III).</li>
        <li>Scroll to the <strong>Account</strong> section.</li>
        <li>Tap <strong>Delete account</strong>.</li>
        <li>Confirm the destructive action. Your account, profile, photos, and matches are removed immediately.</li>
      </ol>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>What is removed</h2>
      <ul>
        <li>Your account and sign-in credentials.</li>
        <li>Your profile, dog, and all photos stored in our private bucket.</li>
        <li>Your swipes and any active matches you are part of.</li>
      </ul>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>What is kept (and why)</h2>
      <ul>
        <li>
          <strong>Messages you sent.</strong> Conversations remain readable for the other side, but your name is
          replaced with "Former member". This preserves the other person's record of the conversation while
          removing your identity from it.
        </li>
        <li>
          <strong>Reports.</strong> Reports you filed or that were filed about you are retained for up to twelve
          months to enforce community safety.
        </li>
      </ul>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>Cannot access the app?</h2>
      <p>
        Email <a href="mailto:hello@canine-society.com">hello@canine-society.com</a> from the email address tied
        to your account. We will verify your identity and delete the account within seven days.
      </p>
    </article>
  );
}
