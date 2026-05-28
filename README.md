# Canine Society App

Mobile app (iOS + Android) for the Canine Society brand — a verified matching and walking community for dog owners.

## Stack
- Expo + React Native + TypeScript
- Supabase (Frankfurt) for auth, database, storage, realtime
- Next.js admin web for moderation (in `admin/`)

## Local dev
```bash
npm install
npx expo start
```
Scan the QR code with Expo Go on your iPhone, or press `a` for the Android emulator.

## Project documents
- Spec: [`docs/superpowers/specs/2026-05-19-canine-society-app-slice-1-design.md`](docs/superpowers/specs/2026-05-19-canine-society-app-slice-1-design.md)
- Plan: [`docs/superpowers/plans/2026-05-19-canine-society-app-slice-1.md`](docs/superpowers/plans/2026-05-19-canine-society-app-slice-1.md)

## Environment
Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key. Never commit `.env.local`.
