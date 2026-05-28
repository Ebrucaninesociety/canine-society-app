export const metadata = { title: 'Terms · Canine Society' };

export default function TermsPage() {
  return (
    <article>
      <div className="label">Document</div>
      <h1 style={{ fontSize: 48, lineHeight: 1, marginTop: 8 }}>Terms of Use</h1>
      <p className="label" style={{ marginTop: 8, opacity: 0.6 }}>Effective 2026-05-28</p>

      <p>
        <strong>This is a draft. It must be reviewed by a qualified lawyer for the German market before the
        application is submitted to the App Store or Google Play.</strong>
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>I. Who can join</h2>
      <p>
        You must be eighteen years of age or older. You must have a dog that lives with you, and you must include
        at least one clear photo of yourself with your dog in your profile.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>II. The review</h2>
      <p>
        Every new profile is reviewed by a moderator before it appears to other members. We may reject or remove
        a profile for any reason, including but not limited to: missing dog photos, stock or misleading images,
        impersonation, harassment, illegal content, or evidence the member is under eighteen.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>III. Conduct</h2>
      <ul>
        <li>Be the person in your photos.</li>
        <li>Do not harass, threaten, or insult other members.</li>
        <li>Do not solicit, scam, advertise, or sell within messages.</li>
        <li>Do not share illegal content, content that is sexual in nature involving minors, or content that
          incites violence.</li>
        <li>Do not share another member's photographs, screenshots, or personal information outside the
          application.</li>
      </ul>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>IV. Reports and consequences</h2>
      <p>
        You can report another member from any chat. Reports are reviewed within twenty-four hours. We may
        suspend or remove accounts that violate these terms without notice. You can also block a member at any
        time; blocked members cannot see you and you cannot see them.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>V. Content</h2>
      <p>
        You retain rights to your photos and messages. By uploading them you grant Canine Society a non-exclusive
        licence to store, display, and process them for the purpose of operating the service.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>VI. Liability</h2>
      <p>
        Canine Society is a private membership platform. We do not vouch for the character or behaviour of any
        member off the platform. Meetings between members occur at your own risk. We are not liable for any harm
        that may result from interactions with other members.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>VII. Ending your membership</h2>
      <p>
        You may delete your account at any time from inside the app (Society → Delete account). After deletion,
        your data is removed within thirty days, with the exceptions described in the <a href="/legal/privacy">Privacy
        Policy</a>.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>VIII. Changes</h2>
      <p>
        We may update these terms. Material changes will be communicated in the app or by email before they take
        effect.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 48 }}>IX. Governing law</h2>
      <p>
        These terms are governed by the laws of Germany. Disputes are subject to the jurisdiction of the courts
        of Hamburg, unless a different jurisdiction is required by mandatory law (e.g. for consumers).
      </p>
    </article>
  );
}
