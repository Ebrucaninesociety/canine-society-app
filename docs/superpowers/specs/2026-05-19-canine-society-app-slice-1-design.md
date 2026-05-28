# Canine Society App — Slice 1 Design

**Date:** 2026-05-19
**Status:** Draft, awaiting user approval
**Scope:** Slice 1 (Foundation / MVP). Walks, premium, ML photo verification, events are explicitly out of scope and live in later slices.

---

## 1. Product summary

A mobile-first matching app for affluent dog owners, positioned inside the Canine Society brand. Two match intents per profile: **Date** (Tinder-style, romantic) and **Walk** (platonic, meet other dog owners to walk together). Slice 1 ships the Date intent end-to-end plus the profile and trust foundation that Walk mode (Slice 2) will reuse. Walk mode itself, including live location, is not in Slice 1.

The visual system is the Canine Society design system (`canine_society_wonjyou_design/DESIGN.md`): Sand surfaces, Deep Ocean ink, The Seasons + DM Sans, squared corners, paper-on-paper layering, no rounded radii, no gradients, no glow. The app is the brand's mobile surface, not a separate visual identity.

## 2. Goals and non-goals

**Goals**
- Verified humans with dogs only. Manual moderation queue gates entry.
- A swipe deck and chat that feel as good as Tinder/Hinge.
- One codebase that ships to iOS App Store and Google Play.
- GDPR-correct from day one (EU data residency, account deletion, data export).
- Faithful execution of the Canine Society design system on mobile.

**Non-goals for Slice 1**
- Walk mode, live location sharing, "out for a walk" status, map view. Slice 2.
- Premium tier, payments, IAP. Slice 3.
- ML-based dog-in-photo verification. Manual review is enough; ML is an optimization.
- Events, meetups, Society house integrations.
- Web app. Mobile only.
- Apple Watch, widgets, Live Activities. Addable later as native extensions.

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Mobile client (Expo + React Native, TypeScript)         │
│  - Expo Router (file-based navigation)                  │
│  - Reanimated 3 + Gesture Handler (swipe deck)          │
│  - FlashList (match + chat lists)                       │
│  - Expo Image (CDN-aware image rendering)               │
│  - Expo Notifications (APNs + FCM)                      │
│  - Supabase JS SDK (auth, db, realtime, storage)        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + WSS
┌──────────────────────▼──────────────────────────────────┐
│ Supabase (EU region, Frankfurt)                         │
│  - Postgres (profiles, swipes, matches, messages,       │
│    reports, moderation_queue)                           │
│  - Auth (email + Apple + Google)                        │
│  - Storage (profile photos, originals + variants)       │
│  - Realtime (chat, match notifications)                 │
│  - Edge Functions (matching trigger, push fan-out,      │
│    moderation actions, account deletion)                │
│  - Row-Level Security on every table                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐   ┌──────────────────────────────┐
│ Expo EAS Build      │   │ Admin web (Next.js, Vercel)  │
│ iOS + Android       │   │ Moderation queue, reports,   │
│ binaries + OTA      │   │ takedowns. Internal only.    │
└─────────────────────┘   └──────────────────────────────┘
```

**Why Supabase over a custom Node/Go backend:** every Slice 1 capability (auth, row-level access, realtime chat, file storage, EU residency, push fan-out via Edge Functions) is in the box. We write Postgres schemas and a handful of Edge Functions rather than a server. If we outgrow Supabase later, Postgres is portable and the auth/storage interfaces are replaceable.

**Why a separate admin web app:** moderation does not belong inside the consumer mobile app. A small Next.js dashboard for the moderator (the founder, initially) hits the same Supabase via a service-role key. Keeps surfaces clean.

## 4. Data model

All tables Postgres. All access via Supabase RLS policies. UUID primary keys. `created_at`/`updated_at` on every table. Soft-delete via `deleted_at` on `profiles` and `dogs` for GDPR audit trail; hard-delete on user request via Edge Function.

### `profiles`
One per user. Created on signup, populated through onboarding.
- `id` (uuid, fk → `auth.users.id`)
- `display_name` (text, 2–40 chars)
- `birthdate` (date, must be ≥18 at signup)
- `gender` (enum: woman | man | non_binary | prefer_not_to_say)
- `looking_for` (enum array: women | men | everyone)
- `intent` (enum array: date | walk) — Slice 1 only `date` is exposed in UI; schema is ready for Slice 2
- `city` (text, free-form, indexed)
- `country` (text, ISO-2)
- `bio` (text, max 500 chars)
- `verification_status` (enum: pending | approved | rejected | banned)
- `verification_reviewed_at` (timestamptz, nullable)
- `verification_reviewed_by` (uuid, nullable, fk → moderator)
- `verification_notes` (text, nullable, moderator-only via RLS)
- `language_pref` (enum: en | de, default en)
- `push_token_ios` (text, nullable)
- `push_token_android` (text, nullable)
- `last_active_at` (timestamptz)
- `deleted_at` (timestamptz, nullable)

### `dogs`
One or more per profile (most users have one; allow up to three for Slice 1).
- `id` (uuid)
- `owner_id` (uuid, fk → `profiles.id`)
- `name` (text, 1–30 chars)
- `breed` (text, free-form)
- `birthdate_approx` (date, nullable)
- `size` (enum: small | medium | large)
- `bio` (text, max 300 chars, nullable)

### `photos`
- `id` (uuid)
- `profile_id` (uuid, fk)
- `storage_path` (text, points into Supabase Storage bucket `profile-photos`)
- `is_primary` (bool)
- `is_dog_photo` (bool) — set true by user when uploading, validated by moderator
- `position` (int, 0–5; max 6 photos per profile)
- `verification_status` (enum: pending | approved | rejected)

### `swipes`
- `id` (uuid)
- `swiper_id` (uuid, fk → `profiles.id`)
- `swipee_id` (uuid, fk → `profiles.id`)
- `direction` (enum: like | pass | superlike)
- `intent` (enum: date | walk) — Slice 1: always `date`
- Unique on `(swiper_id, swipee_id, intent)` — a user can swipe each other user once per intent

### `matches`
Created by trigger when mutual `like` (or `superlike`) exists with same `intent`.
- `id` (uuid)
- `profile_a_id` (uuid)
- `profile_b_id` (uuid) — stored with `profile_a_id < profile_b_id` to avoid duplicates
- `intent` (enum: date | walk)
- `created_at` (timestamptz)
- `unmatched_at` (timestamptz, nullable) — soft-unmatch; either side can do it
- `unmatched_by` (uuid, nullable)

### `messages`
- `id` (uuid)
- `match_id` (uuid, fk → `matches.id`)
- `sender_id` (uuid, fk → `profiles.id`)
- `body` (text, max 2000 chars)
- `created_at` (timestamptz)
- `read_at` (timestamptz, nullable)

### `reports`
- `id` (uuid)
- `reporter_id` (uuid)
- `reported_profile_id` (uuid)
- `reason` (enum: fake_profile | no_dog | inappropriate_photo | harassment | underage | spam | other)
- `details` (text, nullable, max 500 chars)
- `status` (enum: open | resolved | dismissed)
- `resolved_by` (uuid, nullable)
- `resolved_at` (timestamptz, nullable)

### `blocks`
- `blocker_id` (uuid)
- `blocked_id` (uuid)
- Composite PK on the pair. Blocks are mutual-invisible: blocked user does not appear in blocker's deck, blocker does not appear in blocked's deck, no chat possible.

### `moderation_queue` (view, not table)
A Postgres view over `profiles` where `verification_status = 'pending'`, joined to photos and dogs. Read by the admin web.

### Indexes that matter
- `swipes(swiper_id, created_at desc)` — building the deck cursor
- `swipes(swipee_id) where direction in ('like','superlike')` — match detection
- `matches(profile_a_id), matches(profile_b_id)` — match list per user
- `messages(match_id, created_at desc)` — chat history
- `profiles(verification_status, created_at)` — moderation queue ordering

## 5. Authentication and onboarding

**Auth providers:** Email magic link, Sign in with Apple (required by App Store for any app offering social auth), Google sign-in. No passwords. Supabase Auth handles all three.

**Onboarding flow** (post-signup, before deck access):

```
I.   Welcome / age gate (must confirm ≥18)
II.  Name + birthdate
III. Gender + looking_for
IV.  City + country (no GPS in Slice 1; typed)
V.   Photo upload (1 required, up to 6 total)
       - At least one MUST be marked "this photo includes my dog"
       - Camera or library; client-side resize to max 2048px long edge
VI.  Dog profile (name, breed, size, optional bio)
VII. Bio (optional, 500 chars)
VIII. Notification permission prompt (iOS + Android)
IX.  Submitted for review screen
       - "Welcome to the Society. Your profile is under review."
       - Editorial copy, Sand surface, no spinner energy.
       - Email notification when approved (typically <24h).
```

User cannot enter the deck until `verification_status = 'approved'`. Pending users see the editorial waiting screen; rejected users see a copy explaining why with a "edit and resubmit" path.

## 6. Photo verification (manual)

**Why manual:** the brand's whole premise is verified dog owners. A fake/no-dog profile slipping through breaks the premise immediately. ML-based dog detection plus human-in-photo detection is achievable (CLIP + a small classifier) but adds weeks and isn't necessary at Slice 1 volumes.

**Moderator workflow** (admin web app):
- Queue ordered by `created_at` ascending.
- Each card shows: all photos, dog photos flagged, dog details, bio.
- Three buttons: Approve, Reject (reason picker), Request revision (note + which photos).
- SLA target: 24h, soft. Email auto-reminder if queue > 48h.

**Notification on decision:** Edge Function sends transactional email (Resend or Supabase's SMTP) + push if user has a token yet.

## 7. Discovery and matching

**The deck** (the swipe stack):
- Server returns up to 20 candidate profiles per call via a Postgres function `next_deck(user_id, limit)`.
- Candidate filter: `verification_status = 'approved'`, not soft-deleted, not blocked either way, no existing swipe by this user, gender ∈ user's `looking_for`, user's gender ∈ candidate's `looking_for`, same country (Slice 1 simplification; refine in Slice 3 to radius-based).
- Ordering: a simple recency + recency-of-last-active mix for Slice 1. Documented in code, replaceable. No ML ranking yet.

**Card content:** primary photo full-bleed, name + age + city in serif headline at bottom-left over a Sand-to-transparent gradient (the brand allows tonal layering; this is the one tinted overlay), tap to expand into full profile (all photos, dog, bio).

**Gestures:**
- Swipe right → `like`
- Swipe left → `pass`
- Long-press star → `superlike` (cap: 1/day in Slice 1, removable later)
- Reanimated worklets for 120Hz feel. Card returns to centre on cancel.

**Match detection:** Postgres trigger on `swipes` insert. If mutual `like`/`superlike` with same `intent` exists, insert into `matches` and emit a Realtime event to both users. Both users see the "It's a match" screen on next foreground.

**Daily swipe cap:** none in Slice 1. Add in Slice 3 if needed for monetization.

## 8. Chat

- One thread per match. No group chat.
- Realtime via Supabase Realtime channel scoped to `match_id`.
- Messages persist in Postgres.
- Read receipts (single `read_at` per message).
- Typing indicator: Realtime presence on the match channel.
- No image/audio messages in Slice 1 (text only). Reduces moderation surface.
- Block from inside chat: 3-dot menu → Block / Report / Unmatch.

## 9. Notifications

- Push on: new match, new message, profile approved, profile rejected.
- iOS: APNs via Expo Notifications, requires Apple Push key (user provides).
- Android: FCM via Expo Notifications, requires Firebase project (user provides).
- Token stored on `profiles.push_token_ios` / `push_token_android`, refreshed on every cold start.
- Fan-out from Edge Function on relevant Postgres events.

## 10. Trust, safety, compliance

**Mandatory for App Store / Play approval of dating apps:**
- Block (mutual invisible) — implemented.
- Report (reason + free text) — implemented.
- Account deletion in-app — implemented as Edge Function that hard-deletes auth user, anonymizes references in matches/messages (so the other side's history remains coherent), removes photos from Storage.
- Age gate at signup (≥18) — implemented.
- Clear safety guidelines screen in onboarding — copy in spec.
- 24h response SLA on reports — committed in store listing.

**GDPR:**
- Data export endpoint (Edge Function returns ZIP of user's profile + photos + chats as JSON + JPGs).
- Privacy policy + ToS pages (web URLs, linked from app).
- Cookie/tracking: app uses no third-party trackers in Slice 1. Analytics via Supabase logs only.
- EU data residency: Supabase Frankfurt region. Storage bucket same region.

## 11. Navigation and screen inventory

Tab bar (4 tabs, Sand background, hairline 1px top border, Deep Ocean active label, DM Sans uppercase 0.7rem labels with Roman numeral above each):

- **I. Discover** — the deck
- **II. Matches** — list of matches + chat threads
- **III. Society** — profile owner's own profile, dog, settings
- **IV. Edition** — in-app editorial. Slice 1 shows three to five cached articles (title + cover image + body) fetched from the magazine's headless source. Tap opens a native in-app reader, not an external browser, to stay clear of App Store Guideline 4.2 ("apps that primarily link out are rejected").

**Screen list (all referenced screens):**
1. Splash (Sand, wordmark only, no spinner)
2. Auth choice (Apple / Google / Email)
3. Email magic-link sent
4. Onboarding I–IX (see §5)
5. Under review (editorial waiting screen)
6. Discover (deck)
7. Profile detail (overlay from deck card)
8. It's a Match (modal)
9. Matches list
10. Chat thread
11. Society / My profile
12. Edit profile (photos, bio, dog)
13. Settings (notifications, language, blocked users, account deletion, data export, ToS, privacy)
14. Report flow (reason → details → confirm)
15. Block confirm
16. Unmatch confirm
17. Rejected / resubmit

Every screen opens on Sand. No dark heroes. Numbered section markers used inside Settings and onboarding. The Seasons display only on landmark moments (under-review, it's-a-match, splash).

## 12. Branding execution on mobile

- All squared corners (`borderRadius: 0` global).
- Photo cards: Sand frame, hairline 1px Deep Ocean @ 10% opacity, `paper-low` shadow.
- Buttons: Deep Ocean fill with Sand label, uppercase DM Sans, 0.22em tracking, no radius.
- Inputs: underline-only, Deep Ocean, 1px → 2px on focus, shift to Mud on error.
- Tab bar: Sand, Roman numerals + labels, no icons.
- Chat bubbles: outgoing — Deep Ocean fill with Sand text, squared; incoming — Sand fill with Deep Ocean text and a 1px Deep Ocean hairline border, squared. (No Desert as bubble background; the brand reserves Desert for accent surfaces, not body-text-bearing surfaces.)
- "It's a Match" modal: Sand full-screen, Roman numeral chapter mark, The Seasons headline "Una Coincidenza" / "Ein Treffen", two squared buttons (Message / Continue).
- Loading states: no spinners. Use a hairline progress rule (1px Deep Ocean line that fills horizontally) per Paper-on-paper aesthetic.
- One Water-blue moment per session, at most: the approval screen ("You are part of the Society").
- No emoji anywhere in UI.
- No em dashes in UI copy.

## 13. Testing strategy

- **Unit tests** on Postgres functions (`next_deck`, match-detection trigger, blocks filtering) via pgTAP.
- **Edge Function tests** via Deno's test runner.
- **Mobile component tests** via Jest + React Native Testing Library for non-gesture screens.
- **Detox or Maestro E2E** for the critical paths: signup → onboard → approved → swipe → match → chat → block → delete. Maestro is lighter; we'll use Maestro.
- **Manual device matrix:** iPhone 14, iPhone SE (small screen), Pixel 7, a low-end Android (Samsung A14). Slow Android perf is the realistic risk.
- TDD discipline (per `superpowers:test-driven-development`): for every Postgres function and Edge Function, write the test first.

## 14. Open questions for the user

These don't block writing the implementation plan, but answers shape some decisions:

1. **App name** in stores — "Canine Society" or a sub-brand like "Canine Society · Encounters" / "Society Encounters"? Apple won't approve a dating app simply called "Canine Society" without context in the listing.
2. **Moderator at launch** — is it you alone, or do you have a team member? Affects admin web sign-in.
3. **Launch country** — DACH-only at first (filter `country IN ('DE','AT','CH')`) or open to EU/US from day one?

If unanswered, defaults are: name "Canine Society · Encounters", solo moderator (you), launch DACH-only.

## 15. Repository structure

```
canine_societ_app/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   ├── (onboarding)/
│   ├── (tabs)/
│   │   ├── discover.tsx
│   │   ├── matches.tsx
│   │   ├── society.tsx
│   │   └── edition.tsx
│   ├── chat/[matchId].tsx
│   ├── profile/[id].tsx
│   └── settings/
├── components/                   # Reusable UI (cards, buttons, inputs)
├── design/                       # Tokens mirroring DESIGN.md
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── lib/                          # Supabase client, hooks, utils
├── supabase/
│   ├── migrations/               # SQL migrations
│   ├── functions/                # Edge Functions
│   └── seed.sql
├── admin/                        # Next.js moderation app
├── e2e/                          # Maestro flows
├── docs/
│   └── superpowers/
│       ├── specs/                # This file lives here
│       └── plans/                # Implementation plans
├── app.config.ts                 # Expo config
├── eas.json                      # EAS Build config
└── package.json
```

## 16. What's explicitly deferred (and to which slice)

- **Slice 2 — Walks:** walk-mode toggle on profile, "out for a walk" presence, location sharing (radius-blurred), join-walk requests, map view, background location, native widget for "active walks nearby."
- **Slice 3 — Polish + premium:** ML photo verification, breed/size/distance filters, daily swipe caps, super-like packs, premium tier with StoreKit/Play Billing, verification badge, magazine integration into Edition tab, events.
- **Future / undecided:** web app, Apple Watch, Live Activities, in-app voice/video, group walk events.
