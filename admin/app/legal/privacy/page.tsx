export const metadata = { title: 'Privacy Policy · Canine Society' };

export default function PrivacyPage() {
  return (
    <article>
      <div className="label">Document</div>
      <h1 style={{ fontSize: 48, lineHeight: 1, marginTop: 8 }}>Privacy Policy</h1>
      <p className="label" style={{ marginTop: 8, opacity: 0.6 }}>Effective 2026-05-28</p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>I. Who we are</h2>
      <p>
        Canine Society is operated from the EU. This policy explains what personal data the Canine Society mobile
        application collects, how we use it, who has access, and how to remove yourself.
      </p>
      <p>
        <strong>This is a draft. It must be reviewed by a qualified lawyer for the German market (DSGVO / GDPR)
        before the application is submitted to the App Store or Google Play.</strong>
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>II. Data we collect</h2>
      <ul>
        <li>Account: email address, the date the account was created.</li>
        <li>Profile: display name, date of birth, gender, gender preferences, city, country, optional bio.</li>
        <li>Dog: name, breed, approximate birthdate (optional), size, optional bio.</li>
        <li>Photos: images you upload (we store these on Supabase Storage, EU region only).</li>
        <li>Activity: swipes you record, matches that form, messages you send.</li>
        <li>Reports: when you report another member, your identifier is stored with the report.</li>
        <li>Device: a push notification token (if you enable notifications), platform name (iOS / Android).</li>
      </ul>
      <p>We do not collect precise GPS location in the current release.</p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>III. How data is used</h2>
      <ul>
        <li>To show your profile to other approved members and to show their profiles to you.</li>
        <li>To match you when both sides have signalled interest.</li>
        <li>To deliver messages between matched members.</li>
        <li>To send transactional emails (sign-in codes, decision notices).</li>
        <li>To send push notifications (if enabled) for matches, messages, and moderation decisions.</li>
        <li>To enforce community rules (review queue, reports, blocks).</li>
      </ul>
      <p>
        We do not sell personal data. We do not run advertising trackers in the application. We use no third-party
        analytics in the consumer app.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>IV. Where data is stored</h2>
      <p>
        All personal data is stored on Supabase in Frankfurt, Germany (EU central). Photos sit in private storage
        buckets accessible only with signed URLs requested by the application on your behalf.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>V. Sharing</h2>
      <ul>
        <li><strong>Members</strong> see your profile, dog, and photos once you are approved by moderation.</li>
        <li><strong>Moderators</strong> see your profile during the review process; they may take action on reports.</li>
        <li><strong>Supabase</strong>, our infrastructure provider, processes the data on our behalf under a DPA.</li>
        <li><strong>Resend</strong>, our email provider, processes your email address to deliver transactional mail.</li>
        <li><strong>Apple / Google</strong> may process your push token for delivery to your device.</li>
      </ul>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>VI. Your rights (GDPR)</h2>
      <ul>
        <li>Access: ask for a copy of your data.</li>
        <li>Correction: edit your profile directly in the app.</li>
        <li>Deletion: use the in-app "Delete account" path. See also <a href="/legal/account-deletion">account deletion</a>.</li>
        <li>Portability: contact hello@canine-society.com.</li>
        <li>Complaint: you may lodge a complaint with your national data protection authority.</li>
      </ul>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>VII. Retention</h2>
      <p>
        Active profile data is retained until you delete your account. After deletion, messages you sent are
        anonymised (the recipient still sees the conversation but your name becomes "Former member"). Reports and
        moderation logs are retained for up to twelve months to enforce community safety.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>VIII. Children</h2>
      <p>The application is for adults eighteen years of age or older. Accounts that appear to belong to minors are removed.</p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>IX. Changes</h2>
      <p>
        We will post any material change to this page and, where required, notify you in the app or by email
        before the change takes effect.
      </p>
    </article>
  );
}
