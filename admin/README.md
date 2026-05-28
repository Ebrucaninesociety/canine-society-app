# Canine Society — Moderation Web

Internal Next.js dashboard for reviewing pending member profiles. Lives in a separate package so the consumer mobile app stays lean.

## Local dev

```bash
cd admin
cp .env.example .env.local
# fill the values:
#   NEXT_PUBLIC_SUPABASE_URL=https://qwklnxkflmsmgyohihrg.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE_KEY=...   (only in this env file, NEVER in client)
npm install
npm run dev
```

Open http://localhost:3000 and sign in with the email you added to the `moderators` table.

## Adding the founder as the first moderator

The mobile app does not write into `moderators`. After the first email sign-in into the admin web, look up your `auth.users.id` in the Supabase Dashboard SQL Editor:

```sql
SELECT id, email FROM auth.users WHERE email = 'your@email.com';
```

Then insert yourself:

```sql
INSERT INTO moderators (user_id, display_name)
VALUES ('<the uuid from above>', 'Founder');
```

Refresh the admin app. You should now see the moderation queue.

## Deploying

Vercel is the natural target. From this directory:

```bash
npx vercel
```

Set the same four env vars in the Vercel project settings.
