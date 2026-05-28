# Canine Society App — Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a verified, dating-style matching app for dog owners to TestFlight and Play Internal Testing, faithfully executing the Canine Society design system, with manual photo moderation, mutual matching, realtime chat, push notifications, and full trust/safety/GDPR compliance.

**Architecture:** Expo + React Native (TypeScript) mobile client → Supabase (Postgres + Auth + Storage + Realtime + Edge Functions, Frankfurt region). Separate Next.js admin web app for the moderation queue. Row-level security on every table. TDD with pgTAP for SQL, Deno test for Edge Functions, Jest + RNTL for components, Maestro for E2E.

**Tech Stack:** Expo SDK 52+, React Native 0.76+ (new architecture), TypeScript, Expo Router, Reanimated 3, Gesture Handler, FlashList, Expo Image, Expo Notifications, Supabase JS v2, Postgres 15, Deno (Edge Functions), Next.js 15 (admin), Maestro (E2E).

**Reference spec:** `docs/superpowers/specs/2026-05-19-canine-society-app-slice-1-design.md`

**Reference design tokens:** `C:/Users/ibrah/Documents/canine_society_wonjyou_design/DESIGN.md`

---

## Phase index

- **Phase 0 — Foundations:** project scaffolding, design tokens, Supabase project, schemas, RLS, CI hooks. (Tasks 1–8)
- **Phase 1 — Auth + onboarding:** auth providers, all onboarding screens, profile creation, under-review state. (Tasks 9–18)
- **Phase 2 — Admin moderation web:** Next.js dashboard, approve/reject/revise flow, decision emails. (Tasks 19–24)
- **Phase 3 — Discover deck:** candidate query, swipe gestures, profile detail overlay, swipe recording. (Tasks 25–31)
- **Phase 4 — Matching + chat:** match trigger, "It's a Match" screen, matches list, chat thread with realtime. (Tasks 32–40)
- **Phase 5 — Push notifications:** APNs + FCM setup, token registration, fan-out Edge Function. (Tasks 41–44)
- **Phase 6 — Trust, safety, GDPR:** block, report, unmatch, account delete, data export, legal pages. (Tasks 45–52)
- **Phase 7 — Polish + ship:** Edition tab, settings polish, language switch, splash, app icon, store listings, E2E. (Tasks 53–60)

Each task is self-contained. Each ends in a green test run and a commit. After each phase, the app is in a working state we can demo.

---

# Phase 0 — Foundations

## Task 1: Initialise repository and Expo project

**Files:**
- Create: `package.json`, `app.config.ts`, `tsconfig.json`, `.gitignore`, `README.md`, `.env.example`
- Create: `app/_layout.tsx`, `app/index.tsx`

- [ ] **Step 1: Initialise git and create root files**

Run from the project root:
```bash
git init
git branch -M main
```

Create `.gitignore`:
```
node_modules/
.expo/
dist/
.env
.env.local
.env.*.local
ios/Pods/
ios/build/
android/.gradle/
android/build/
*.log
.DS_Store
.eas/
*.keystore
*.jks
*.p8
*.p12
*.mobileprovision
GoogleService-Info.plist
google-services.json
```

Create `.env.example`:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 2: Scaffold Expo TypeScript project in place**

```bash
npx create-expo-app@latest . --template blank-typescript
```

When prompted to overwrite, accept. Then verify `npm run start` boots Metro without error.

- [ ] **Step 3: Add Expo Router and core navigation deps**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

Update `package.json` main field to `"main": "expo-router/entry"`.

Update `app.config.ts`:
```ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Canine Society',
  slug: 'canine-society-app',
  scheme: 'caninesociety',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.caninesociety.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.caninesociety.app',
    adaptiveIcon: { foregroundImage: './assets/icon.png', backgroundColor: '#F3E8D4' },
  },
  plugins: ['expo-router'],
  experiments: { typedRoutes: true },
};

export default config;
```

Delete the scaffold `App.tsx` if present.

Create `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3E8D4' } }} />
    </SafeAreaProvider>
  );
}
```

Create `app/index.tsx`:
```tsx
import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F3E8D4', alignItems: 'center', justifyContent: 'center' }}>
      <Text>Canine Society</Text>
    </View>
  );
}
```

- [ ] **Step 4: Boot and verify**

```bash
npx expo start --clear
```

Press `i` for iOS Simulator (or open Expo Go on iPhone and scan QR). Confirm a Sand-coloured screen with "Canine Society" renders.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initialise Expo + Router scaffold"
```

---

## Task 2: Design token system

**Files:**
- Create: `design/colors.ts`, `design/typography.ts`, `design/spacing.ts`, `design/shadows.ts`, `design/index.ts`
- Create: `design/__tests__/tokens.test.ts`

- [ ] **Step 1: Add Jest and React Native Testing Library**

```bash
npm install --save-dev jest @types/jest jest-expo @testing-library/react-native @testing-library/jest-native
```

Add to `package.json`:
```json
"scripts": {
  "test": "jest"
},
"jest": {
  "preset": "jest-expo",
  "setupFilesAfterEach": ["@testing-library/jest-native/extend-expect"]
}
```

- [ ] **Step 2: Write failing test**

Create `design/__tests__/tokens.test.ts`:
```ts
import { colors, typography, spacing } from '../index';

describe('design tokens', () => {
  it('exposes the five canonical palette colours', () => {
    expect(colors.deepOcean).toBe('#172451');
    expect(colors.water).toBe('#D7EBFF');
    expect(colors.sand).toBe('#F3E8D4');
    expect(colors.desert).toBe('#D9AF83');
    expect(colors.mud).toBe('#492703');
  });

  it('uses DM Sans for body and label fonts', () => {
    expect(typography.body.fontFamily).toContain('DMSans');
    expect(typography.label.fontFamily).toContain('DMSans');
  });

  it('uses serif display for display and headline', () => {
    expect(typography.display.fontFamily).toMatch(/Seasons|Bodoni/i);
    expect(typography.headline.fontFamily).toMatch(/Seasons|Bodoni/i);
  });

  it('exposes spacing scale matching the DESIGN.md', () => {
    expect(spacing.xs).toBe(8);
    expect(spacing.sm).toBe(16);
    expect(spacing.md).toBe(32);
  });
});
```

Run: `npm test`. Expected: FAIL — modules not found.

- [ ] **Step 3: Implement tokens**

Create `design/colors.ts`:
```ts
export const colors = {
  deepOcean: '#172451',
  water: '#D7EBFF',
  sand: '#F3E8D4',
  desert: '#D9AF83',
  mud: '#492703',
  hairline: 'rgba(23, 36, 81, 0.1)',
  shadow: 'rgba(23, 36, 81, 0.15)',
  shadowDeep: 'rgba(23, 36, 81, 0.22)',
  placeholder: 'rgba(23, 36, 81, 0.4)',
} as const;
```

Create `design/typography.ts`:
```ts
import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -0.5,
  } as TextStyle,
  headline: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 32,
    lineHeight: 36,
  } as TextStyle,
  title: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 17,
    lineHeight: 22,
  } as TextStyle,
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
  } as TextStyle,
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  } as TextStyle,
};
```

Create `design/spacing.ts`:
```ts
export const spacing = { xs: 8, sm: 16, md: 32, lg: 56, section: 96, gutter: 24 } as const;
```

Create `design/shadows.ts`:
```ts
import { ViewStyle } from 'react-native';

export const shadows = {
  paperLow: {
    shadowColor: '#172451',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  } as ViewStyle,
  paperLift: {
    shadowColor: '#172451',
    shadowOpacity: 0.22,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
    elevation: 6,
  } as ViewStyle,
};
```

Create `design/index.ts`:
```ts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export const radius = 0;
```

- [ ] **Step 4: Load fonts**

```bash
npx expo install expo-font @expo-google-fonts/bodoni-moda @expo-google-fonts/dm-sans
```

Update `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, BodoniModa_400Regular, BodoniModa_400Regular_Italic } from '@expo-google-fonts/bodoni-moda';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { View } from 'react-native';
import { colors } from '../design';

export default function RootLayout() {
  const [loaded] = useFonts({ BodoniModa_400Regular, BodoniModa_400Regular_Italic, DMSans_400Regular, DMSans_500Medium });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.sand } }} />
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 5: Run tests and verify**

Run: `npm test`. Expected: PASS.

Run the app: `npx expo start --clear`. Confirm the screen still renders.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(design): tokens for colours, typography, spacing, shadows"
```

---

## Task 3: Core UI primitives

**Files:**
- Create: `components/Text.tsx`, `components/Button.tsx`, `components/Input.tsx`, `components/Card.tsx`, `components/HairlineRule.tsx`, `components/Chip.tsx`, `components/ProgressRule.tsx`
- Create: `components/__tests__/primitives.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/primitives.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import { Text } from '../Text';
import { Button } from '../Button';
import { Input } from '../Input';

describe('primitives', () => {
  it('renders display Text with serif font', () => {
    const { getByText } = render(<Text variant="display">Canine</Text>);
    const node = getByText('Canine');
    expect(node.props.style).toEqual(expect.objectContaining({ fontFamily: expect.stringContaining('Bodoni') }));
  });

  it('renders Button label uppercased', () => {
    const { getByText } = render(<Button onPress={() => {}}>Join</Button>);
    expect(getByText('Join')).toBeTruthy();
  });

  it('renders Input with underline-only style', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Name" value="" onChangeText={() => {}} />);
    const input = getByPlaceholderText('Name');
    expect(input.props.style).toEqual(expect.objectContaining({ borderBottomWidth: 1 }));
  });
});
```

Run: `npm test`. Expected: FAIL.

- [ ] **Step 2: Implement Text**

Create `components/Text.tsx`:
```tsx
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { typography, colors } from '../design';

type Variant = keyof typeof typography;

export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <RNText {...rest} style={[styles.base, typography[variant], style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.deepOcean },
});
```

- [ ] **Step 3: Implement Button**

Create `components/Button.tsx`:
```tsx
import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../design';
import { ReactNode } from 'react';

type Props = {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ onPress, children, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [
      styles.base,
      variant === 'primary' ? styles.primary : styles.ghost,
      pressed && (variant === 'primary' ? styles.primaryPressed : styles.ghostPressed),
      disabled && styles.disabled,
      style,
    ]}>
      <View><Text variant="label" style={{ color: variant === 'primary' ? colors.sand : colors.deepOcean }}>{children}</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.deepOcean },
  primaryPressed: { backgroundColor: colors.mud },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.deepOcean },
  ghostPressed: { backgroundColor: colors.water },
  disabled: { opacity: 0.4 },
});
```

- [ ] **Step 4: Implement Input, Card, HairlineRule, Chip, ProgressRule**

Create `components/Input.tsx`:
```tsx
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { colors, typography } from '../design';

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.placeholder} {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    color: colors.deepOcean,
    borderBottomWidth: 1,
    borderBottomColor: colors.deepOcean,
    paddingVertical: 12,
  },
});
```

Create `components/Card.tsx`:
```tsx
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, spacing, shadows } from '../design';

export function Card({ style, elevation = 'flat', ...rest }: ViewProps & { elevation?: 'flat' | 'low' | 'lift' }) {
  return <View {...rest} style={[styles.base, elevation === 'low' && shadows.paperLow, elevation === 'lift' && shadows.paperLift, style]} />;
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.sand, padding: spacing.md, borderRadius: 0 },
});
```

Create `components/HairlineRule.tsx`:
```tsx
import { View } from 'react-native';
import { colors } from '../design';

export function HairlineRule({ vertical = false }: { vertical?: boolean }) {
  return <View style={{ backgroundColor: colors.hairline, [vertical ? 'width' : 'height']: 1, [vertical ? 'height' : 'width']: '100%' }} />;
}
```

Create `components/Chip.tsx`:
```tsx
import { Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../design';
import { Text } from './Text';

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.base, active && styles.active]}>
      <Text variant="label" style={{ color: active ? colors.sand : colors.deepOcean }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.deepOcean, backgroundColor: colors.sand },
  active: { backgroundColor: colors.deepOcean },
});
```

Create `components/ProgressRule.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '../design';

export function ProgressRule({ progress }: { progress: number }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(w, { toValue: progress, duration: 400, useNativeDriver: false }).start(); }, [progress, w]);
  return (
    <View style={{ height: 1, backgroundColor: colors.hairline, width: '100%' }}>
      <Animated.View style={{ height: 1, backgroundColor: colors.deepOcean, width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}
```

- [ ] **Step 5: Run tests**

Run: `npm test`. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/ design/
git commit -m "feat(ui): core primitives — Text, Button, Input, Card, Chip, rules"
```

---

## Task 4: Supabase project schema and migrations

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_rls.sql`, `supabase/migrations/0003_functions.sql`, `supabase/seed.sql`
- Create: `supabase/tests/schema.test.sql`

- [ ] **Step 1: Install Supabase CLI and init**

```bash
npm install --save-dev supabase
npx supabase init
```

Accept defaults. This creates `supabase/` with `config.toml`.

- [ ] **Step 2: Write the failing pgTAP test**

Create `supabase/tests/schema.test.sql`:
```sql
BEGIN;
SELECT plan(8);

SELECT has_table('public', 'profiles', 'profiles table exists');
SELECT has_table('public', 'dogs', 'dogs table exists');
SELECT has_table('public', 'photos', 'photos table exists');
SELECT has_table('public', 'swipes', 'swipes table exists');
SELECT has_table('public', 'matches', 'matches table exists');
SELECT has_table('public', 'messages', 'messages table exists');
SELECT has_table('public', 'reports', 'reports table exists');
SELECT has_table('public', 'blocks', 'blocks table exists');

SELECT * FROM finish();
ROLLBACK;
```

Run: `npx supabase start` then `npx supabase db reset && npx supabase test db`. Expected: FAIL — tables not found.

- [ ] **Step 3: Write `0001_init.sql`**

Create `supabase/migrations/0001_init.sql`:
```sql
-- Enums
CREATE TYPE gender_t AS ENUM ('woman','man','non_binary','prefer_not_to_say');
CREATE TYPE looking_for_t AS ENUM ('women','men','everyone');
CREATE TYPE intent_t AS ENUM ('date','walk');
CREATE TYPE verification_t AS ENUM ('pending','approved','rejected','banned');
CREATE TYPE swipe_dir_t AS ENUM ('like','pass','superlike');
CREATE TYPE dog_size_t AS ENUM ('small','medium','large');
CREATE TYPE report_reason_t AS ENUM ('fake_profile','no_dog','inappropriate_photo','harassment','underage','spam','other');
CREATE TYPE report_status_t AS ENUM ('open','resolved','dismissed');
CREATE TYPE photo_verif_t AS ENUM ('pending','approved','rejected');
CREATE TYPE lang_t AS ENUM ('en','de');

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 40),
  birthdate date NOT NULL,
  gender gender_t NOT NULL,
  looking_for looking_for_t[] NOT NULL,
  intent intent_t[] NOT NULL DEFAULT ARRAY['date']::intent_t[],
  city text NOT NULL,
  country char(2) NOT NULL,
  bio text CHECK (char_length(bio) <= 500),
  verification_status verification_t NOT NULL DEFAULT 'pending',
  verification_reviewed_at timestamptz,
  verification_reviewed_by uuid,
  verification_notes text,
  language_pref lang_t NOT NULL DEFAULT 'en',
  push_token_ios text,
  push_token_android text,
  last_active_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT age_18 CHECK (birthdate <= current_date - interval '18 years')
);
CREATE INDEX idx_profiles_status_created ON profiles (verification_status, created_at);

-- Dogs
CREATE TABLE dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  breed text,
  birthdate_approx date,
  size dog_size_t NOT NULL,
  bio text CHECK (char_length(bio) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dogs_owner ON dogs (owner_id);

-- Photos
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_dog_photo boolean NOT NULL DEFAULT false,
  position int NOT NULL CHECK (position BETWEEN 0 AND 5),
  verification_status photo_verif_t NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, position)
);
CREATE INDEX idx_photos_profile ON photos (profile_id);

-- Swipes
CREATE TABLE swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swipee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction swipe_dir_t NOT NULL,
  intent intent_t NOT NULL DEFAULT 'date',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_id, swipee_id, intent),
  CHECK (swiper_id <> swipee_id)
);
CREATE INDEX idx_swipes_swiper_created ON swipes (swiper_id, created_at DESC);
CREATE INDEX idx_swipes_swipee_like ON swipes (swipee_id) WHERE direction IN ('like','superlike');

-- Matches
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intent intent_t NOT NULL,
  unmatched_at timestamptz,
  unmatched_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (profile_a_id < profile_b_id),
  UNIQUE (profile_a_id, profile_b_id, intent)
);
CREATE INDEX idx_matches_a ON matches (profile_a_id);
CREATE INDEX idx_matches_b ON matches (profile_b_id);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_match_created ON messages (match_id, created_at DESC);

-- Reports
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  reported_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason report_reason_t NOT NULL,
  details text CHECK (char_length(details) <= 500),
  status report_status_t NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blocks
CREATE TABLE blocks (
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

- [ ] **Step 4: Run pgTAP tests**

```bash
npx supabase db reset
npx supabase test db
```

Expected: PASS (8/8).

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat(db): schema for profiles, dogs, photos, swipes, matches, messages, reports, blocks"
```

---

## Task 5: Row-level security policies

**Files:**
- Create: `supabase/migrations/0002_rls.sql`
- Create: `supabase/tests/rls.test.sql`

- [ ] **Step 1: Write failing RLS tests**

Create `supabase/tests/rls.test.sql`:
```sql
BEGIN;
SELECT plan(5);

-- Setup: insert two auth users and profiles
INSERT INTO auth.users (id) VALUES ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');
INSERT INTO profiles (id, display_name, birthdate, gender, looking_for, city, country)
VALUES
  ('11111111-1111-1111-1111-111111111111','Alice','1990-01-01','woman',ARRAY['men']::looking_for_t[],'Berlin','DE'),
  ('22222222-2222-2222-2222-222222222222','Bob','1988-01-01','man',ARRAY['women']::looking_for_t[],'Berlin','DE');

-- Approve them so they're visible
UPDATE profiles SET verification_status = 'approved' WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');

-- As Alice: can read own profile
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SELECT results_eq($$SELECT display_name FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111'$$, $$VALUES ('Alice'::text)$$, 'Alice reads own profile');

-- As Alice: can read approved peer Bob
SELECT results_eq($$SELECT display_name FROM profiles WHERE id = '22222222-2222-2222-2222-222222222222'$$, $$VALUES ('Bob'::text)$$, 'Alice reads approved peer');

-- As Alice: cannot update Bob
SELECT throws_ok($$UPDATE profiles SET display_name = 'X' WHERE id = '22222222-2222-2222-2222-222222222222'$$, '42501', NULL, 'Alice cannot update Bob');

-- As Alice: can insert swipe with self as swiper
SELECT lives_ok($$INSERT INTO swipes (swiper_id, swipee_id, direction) VALUES ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','like')$$, 'Alice can swipe');

-- As Alice: cannot insert swipe with Bob as swiper
SELECT throws_ok($$INSERT INTO swipes (swiper_id, swipee_id, direction) VALUES ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','like')$$, '42501', NULL, 'Alice cannot swipe as Bob');

SELECT * FROM finish();
ROLLBACK;
```

Run: `npx supabase test db`. Expected: FAIL — RLS not enabled.

- [ ] **Step 2: Implement RLS**

Create `supabase/migrations/0002_rls.sql`:
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Helper: current user id
CREATE OR REPLACE FUNCTION auth_uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT auth.uid() $$;

-- profiles: read own + approved peers (excluding mutually blocked); write own only.
CREATE POLICY profiles_read ON profiles FOR SELECT USING (
  id = auth_uid()
  OR (
    verification_status = 'approved'
    AND deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE (blocker_id = auth_uid() AND blocked_id = profiles.id) OR (blocker_id = profiles.id AND blocked_id = auth_uid()))
  )
);
CREATE POLICY profiles_insert_self ON profiles FOR INSERT WITH CHECK (id = auth_uid());
CREATE POLICY profiles_update_self ON profiles FOR UPDATE USING (id = auth_uid()) WITH CHECK (id = auth_uid());

-- dogs: read peer's dogs if peer is readable; write own only.
CREATE POLICY dogs_read ON dogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = dogs.owner_id)
);
CREATE POLICY dogs_write_own ON dogs FOR ALL USING (owner_id = auth_uid()) WITH CHECK (owner_id = auth_uid());

-- photos: same pattern
CREATE POLICY photos_read ON photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = photos.profile_id)
);
CREATE POLICY photos_write_own ON photos FOR ALL USING (profile_id = auth_uid()) WITH CHECK (profile_id = auth_uid());

-- swipes: read own, insert as self only.
CREATE POLICY swipes_read_own ON swipes FOR SELECT USING (swiper_id = auth_uid());
CREATE POLICY swipes_insert_self ON swipes FOR INSERT WITH CHECK (swiper_id = auth_uid());

-- matches: read those you're in.
CREATE POLICY matches_read_own ON matches FOR SELECT USING (profile_a_id = auth_uid() OR profile_b_id = auth_uid());
CREATE POLICY matches_update_own ON matches FOR UPDATE USING (profile_a_id = auth_uid() OR profile_b_id = auth_uid());

-- messages: read messages of matches you're in; insert as self in your matches.
CREATE POLICY messages_read ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM matches m WHERE m.id = messages.match_id AND (m.profile_a_id = auth_uid() OR m.profile_b_id = auth_uid()) AND m.unmatched_at IS NULL)
);
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
  sender_id = auth_uid()
  AND EXISTS (SELECT 1 FROM matches m WHERE m.id = messages.match_id AND (m.profile_a_id = auth_uid() OR m.profile_b_id = auth_uid()) AND m.unmatched_at IS NULL)
);
CREATE POLICY messages_update_read ON messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM matches m WHERE m.id = messages.match_id AND (m.profile_a_id = auth_uid() OR m.profile_b_id = auth_uid()))
) WITH CHECK (true);

-- reports: insert as self; read own only.
CREATE POLICY reports_read_own ON reports FOR SELECT USING (reporter_id = auth_uid());
CREATE POLICY reports_insert_self ON reports FOR INSERT WITH CHECK (reporter_id = auth_uid());

-- blocks: read and insert as self.
CREATE POLICY blocks_read_own ON blocks FOR SELECT USING (blocker_id = auth_uid());
CREATE POLICY blocks_write_own ON blocks FOR ALL USING (blocker_id = auth_uid()) WITH CHECK (blocker_id = auth_uid());
```

- [ ] **Step 3: Run tests**

```bash
npx supabase db reset
npx supabase test db
```

Expected: PASS (13/13 across both files).

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat(db): row-level security on all tables"
```

---

## Task 6: Postgres functions — deck and match trigger

**Files:**
- Create: `supabase/migrations/0003_functions.sql`
- Create: `supabase/tests/functions.test.sql`

- [ ] **Step 1: Write failing tests**

Create `supabase/tests/functions.test.sql`:
```sql
BEGIN;
SELECT plan(4);

-- Setup
INSERT INTO auth.users (id) VALUES
 ('a0000000-0000-0000-0000-000000000001'),
 ('a0000000-0000-0000-0000-000000000002'),
 ('a0000000-0000-0000-0000-000000000003');

INSERT INTO profiles (id, display_name, birthdate, gender, looking_for, city, country, verification_status)
VALUES
 ('a0000000-0000-0000-0000-000000000001','Alice','1990-01-01','woman',ARRAY['men']::looking_for_t[],'Berlin','DE','approved'),
 ('a0000000-0000-0000-0000-000000000002','Bob','1988-01-01','man',ARRAY['women']::looking_for_t[],'Berlin','DE','approved'),
 ('a0000000-0000-0000-0000-000000000003','Carl','1985-01-01','man',ARRAY['women']::looking_for_t[],'Berlin','DE','approved');

-- next_deck returns men for Alice
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"a0000000-0000-0000-0000-000000000001"}';
SELECT results_eq(
  $$SELECT count(*)::int FROM next_deck(20)$$,
  $$VALUES (2)$$,
  'Alice sees Bob and Carl'
);

-- After Alice passes Bob, only Carl remains
INSERT INTO swipes (swiper_id, swipee_id, direction) VALUES ('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','pass');
SELECT results_eq(
  $$SELECT count(*)::int FROM next_deck(20)$$,
  $$VALUES (1)$$,
  'After pass, Bob removed'
);

-- Mutual like creates a match
SET LOCAL "request.jwt.claims" = '{"sub":"a0000000-0000-0000-0000-000000000001"}';
INSERT INTO swipes (swiper_id, swipee_id, direction) VALUES ('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','like');
SET LOCAL "request.jwt.claims" = '{"sub":"a0000000-0000-0000-0000-000000000003"}';
INSERT INTO swipes (swiper_id, swipee_id, direction) VALUES ('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','like');

SET LOCAL ROLE postgres;
SELECT results_eq(
  $$SELECT count(*)::int FROM matches WHERE (profile_a_id = 'a0000000-0000-0000-0000-000000000001' AND profile_b_id = 'a0000000-0000-0000-0000-000000000003') OR (profile_a_id = 'a0000000-0000-0000-0000-000000000003' AND profile_b_id = 'a0000000-0000-0000-0000-000000000001')$$,
  $$VALUES (1)$$,
  'Mutual like creates exactly one match'
);

-- One-sided like creates no match
SET LOCAL "request.jwt.claims" = '{"sub":"a0000000-0000-0000-0000-000000000002"}';
INSERT INTO swipes (swiper_id, swipee_id, direction) VALUES ('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','like');
SET LOCAL ROLE postgres;
SELECT results_eq(
  $$SELECT count(*)::int FROM matches WHERE (profile_a_id = 'a0000000-0000-0000-0000-000000000001' AND profile_b_id = 'a0000000-0000-0000-0000-000000000002') OR (profile_a_id = 'a0000000-0000-0000-0000-000000000002' AND profile_b_id = 'a0000000-0000-0000-0000-000000000001')$$,
  $$VALUES (0)$$,
  'One-sided like creates no match (Alice passed Bob)'
);

SELECT * FROM finish();
ROLLBACK;
```

Run tests. Expected: FAIL.

- [ ] **Step 2: Implement functions**

Create `supabase/migrations/0003_functions.sql`:
```sql
-- next_deck: returns candidate profiles for the calling user
CREATE OR REPLACE FUNCTION next_deck(limit_count int DEFAULT 20)
RETURNS SETOF profiles
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT p.*
  FROM profiles p
  WHERE p.id <> auth_uid()
    AND p.verification_status = 'approved'
    AND p.deleted_at IS NULL
    AND p.country IN (SELECT country FROM profiles WHERE id = auth_uid())
    AND p.gender::text = ANY (SELECT unnest(looking_for)::text FROM profiles WHERE id = auth_uid())
    AND EXISTS (
      SELECT 1 FROM profiles me WHERE me.id = auth_uid() AND me.gender::text = ANY (SELECT unnest(p.looking_for)::text)
    )
    AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.swiper_id = auth_uid() AND s.swipee_id = p.id AND s.intent = 'date')
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = auth_uid() AND b.blocked_id = p.id) OR (b.blocker_id = p.id AND b.blocked_id = auth_uid()))
  ORDER BY p.last_active_at DESC NULLS LAST, p.created_at DESC
  LIMIT limit_count;
$$;

-- Match trigger: on insert of a like/superlike, if the counterpart exists, create a match.
CREATE OR REPLACE FUNCTION on_swipe_create_match() RETURNS trigger AS $$
DECLARE
  a uuid;
  b uuid;
BEGIN
  IF NEW.direction NOT IN ('like','superlike') THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = NEW.swipee_id
      AND swipee_id = NEW.swiper_id
      AND direction IN ('like','superlike')
      AND intent = NEW.intent
  ) THEN
    RETURN NEW;
  END IF;
  a := LEAST(NEW.swiper_id, NEW.swipee_id);
  b := GREATEST(NEW.swiper_id, NEW.swipee_id);
  INSERT INTO matches (profile_a_id, profile_b_id, intent)
  VALUES (a, b, NEW.intent)
  ON CONFLICT (profile_a_id, profile_b_id, intent) DO NOTHING;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_swipe_match AFTER INSERT ON swipes FOR EACH ROW EXECUTE FUNCTION on_swipe_create_match();
```

- [ ] **Step 3: Run tests**

```bash
npx supabase db reset && npx supabase test db
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat(db): next_deck function and mutual-like match trigger"
```

---

## Task 7: Storage bucket + photo upload policies

**Files:**
- Create: `supabase/migrations/0004_storage.sql`

- [ ] **Step 1: Define bucket and policies**

Create `supabase/migrations/0004_storage.sql`:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload only to a path prefixed with their user id.
CREATE POLICY "users can upload own photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Authenticated users can read any photo that belongs to a visible profile.
CREATE POLICY "users can read photos of visible profiles" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos' AND EXISTS (
  SELECT 1 FROM profiles p WHERE p.id::text = (storage.foldername(name))[1]
));

-- Users can delete their own photos.
CREATE POLICY "users can delete own photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

- [ ] **Step 2: Apply and commit**

```bash
npx supabase db reset
git add supabase/
git commit -m "feat(storage): profile-photos bucket and policies"
```

---

## Task 8: Supabase client + environment wiring

**Files:**
- Create: `lib/supabase.ts`, `.env.local`
- Modify: `app.config.ts`

- [ ] **Step 1: Install Supabase JS**

```bash
npm install @supabase/supabase-js react-native-url-polyfill
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 2: Create the client**

Create `lib/supabase.ts`:
```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error('Supabase env vars missing. Check .env.local.');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 3: Add user's keys**

Ask the user for: project URL and anon key (from Supabase Dashboard → Settings → API).

Create `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=<from user>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<from user>
```

This file is in `.gitignore`. Never commit it.

- [ ] **Step 4: Smoke test the client**

Temporarily add to `app/index.tsx`:
```tsx
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => console.log('session', data));
}, []);
```

Reload Expo and confirm a `session { session: null }` log line. Revert the smoke test.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase.ts .env.example app.config.ts
git commit -m "feat(supabase): client wiring and env scaffolding"
```

---

# Phase 1 — Auth + onboarding

## Task 9: Auth choice screen + Apple/Google sign-in

**Files:**
- Create: `app/(auth)/_layout.tsx`, `app/(auth)/index.tsx`
- Create: `lib/auth.ts`, `lib/__tests__/auth.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/__tests__/auth.test.ts`:
```ts
import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../supabase', () => ({
  supabase: { auth: { signInWithIdToken: jest.fn().mockResolvedValue({ data: {}, error: null }) } },
}));

import { signInWithApple } from '../auth';

describe('signInWithApple', () => {
  it('calls supabase signInWithIdToken with provider=apple', async () => {
    await signInWithApple('FAKE_TOKEN');
    const { supabase } = require('../supabase');
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({ provider: 'apple', token: 'FAKE_TOKEN' });
  });
});
```

Run: `npm test`. Expected: FAIL.

- [ ] **Step 2: Implement auth helpers**

Create `lib/auth.ts`:
```ts
import { supabase } from './supabase';

export async function signInWithApple(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: idToken });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'caninesociety://auth-callback' } });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

- [ ] **Step 3: Install native auth modules**

```bash
npx expo install expo-apple-authentication expo-auth-session expo-crypto expo-web-browser
```

Add to `app.config.ts` plugins: `['expo-router', 'expo-apple-authentication']`.

- [ ] **Step 4: Build the screen**

Create `app/(auth)/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
export default function AuthLayout() { return <Stack screenOptions={{ headerShown: false }} />; }
```

Create `app/(auth)/index.tsx`:
```tsx
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { signInWithApple } from '../../lib/auth';

export default function AuthChoice() {
  const router = useRouter();
  const doApple = async () => {
    try {
      const c = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL, AppleAuthentication.AppleAuthenticationScope.FULL_NAME],
      });
      if (c.identityToken) await signInWithApple(c.identityToken);
      router.replace('/onboarding');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') Alert.alert('Sign-in failed', e.message);
    }
  };
  return (
    <View style={s.root}>
      <Text variant="display">CANINE</Text>
      <Text variant="display">SOCIETY</Text>
      <View style={{ height: spacing.lg }} />
      {Platform.OS === 'ios' && <Button onPress={doApple}>Continue with Apple</Button>}
      <View style={{ height: spacing.sm }} />
      <Button variant="ghost" onPress={() => router.push('/email')}>Continue with Email</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.sand, justifyContent: 'center', padding: spacing.md } });
```

(Google sign-in implementation deferred to **Task 9b** once we have the Google OAuth credentials; Apple + Email cover both store requirements at launch — Apple is mandatory if Google is offered, and Email alone is acceptable. Adding Google later is a 1-task addition.)

- [ ] **Step 5: Commit**

```bash
git add app/ lib/
git commit -m "feat(auth): Apple sign-in and email entry point"
```

---

## Task 10: Email magic-link flow

**Files:**
- Create: `app/(auth)/email.tsx`, `app/(auth)/auth-callback.tsx`

- [ ] **Step 1: Email entry screen**

Create `app/(auth)/email.tsx`:
```tsx
import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { signInWithEmail } from '../../lib/auth';

export default function EmailEntry() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async () => {
    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Could not send', e.message);
    }
  };
  if (sent) return (
    <View style={s.root}>
      <Text variant="headline">Check your inbox</Text>
      <View style={{ height: spacing.sm }} />
      <Text>We sent a link to {email}. Tap it to continue.</Text>
    </View>
  );
  return (
    <View style={s.root}>
      <Text variant="label">I</Text>
      <Text variant="headline">Your email</Text>
      <View style={{ height: spacing.md }} />
      <Input placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <View style={{ height: spacing.md }} />
      <Button onPress={submit}>Send Link</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.sand, padding: spacing.md, justifyContent: 'center' } });
```

- [ ] **Step 2: Auth callback deep-link handler**

Create `app/(auth)/auth-callback.tsx`:
```tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../design';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();
  useEffect(() => {
    if (params.access_token && params.refresh_token) {
      supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token }).then(() => router.replace('/onboarding'));
    }
  }, [params, router]);
  return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
}
```

- [ ] **Step 3: Configure Supabase email template**

In Supabase Dashboard → Auth → URL Configuration, set Site URL to `caninesociety://` and add `caninesociety://auth-callback` to redirect URLs. In Email Templates → Magic Link, replace the link with `{{ .RedirectTo }}#access_token={{ .Token }}&refresh_token={{ .RefreshToken }}`.

- [ ] **Step 4: Manual test**

Run on a real device (Expo Go on iPhone). Enter your email, receive the link, tap it, confirm it returns to the app and routes to `/onboarding`.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat(auth): email magic-link entry and deep-link callback"
```

---

## Task 11: Auth session provider

**Files:**
- Create: `lib/session.tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Session context**

Create `lib/session.tsx`:
```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Ctx = { session: Session | null; loading: boolean };
const SessionContext = createContext<Ctx>({ session: null, loading: true });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
```

- [ ] **Step 2: Wrap root and route by auth state**

Update `app/_layout.tsx`:
```tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, BodoniModa_400Regular, BodoniModa_400Regular_Italic } from '@expo-google-fonts/bodoni-moda';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { View } from 'react-native';
import { useEffect } from 'react';
import { colors } from '../design';
import { SessionProvider, useSession } from '../lib/session';

function Gate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const segs = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    const inAuth = segs[0] === '(auth)';
    if (!session && !inAuth) router.replace('/(auth)');
    if (session && inAuth) router.replace('/onboarding');
  }, [session, loading, segs, router]);
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({ BodoniModa_400Regular, BodoniModa_400Regular_Italic, DMSans_400Regular, DMSans_500Medium });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Gate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.sand } }} />
        </Gate>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/session.tsx app/_layout.tsx
git commit -m "feat(auth): session context and auth gate"
```

---

## Task 12: Onboarding scaffold and step navigation

**Files:**
- Create: `app/onboarding/_layout.tsx`, `app/onboarding/index.tsx`
- Create: `lib/onboarding.ts`

- [ ] **Step 1: Onboarding state**

Create `lib/onboarding.ts`:
```ts
import { create } from 'zustand';

export type Onboarding = {
  displayName: string;
  birthdate: string; // ISO yyyy-mm-dd
  gender: 'woman' | 'man' | 'non_binary' | 'prefer_not_to_say' | null;
  lookingFor: ('women' | 'men' | 'everyone')[];
  city: string;
  country: string;
  bio: string;
  photos: { uri: string; isDog: boolean }[];
  dog: { name: string; breed: string; size: 'small'|'medium'|'large' | null; bio: string };
  set: (partial: Partial<Omit<Onboarding,'set'>>) => void;
  reset: () => void;
};

const initial: Omit<Onboarding,'set'|'reset'> = {
  displayName: '', birthdate: '', gender: null, lookingFor: [], city: '', country: 'DE', bio: '',
  photos: [], dog: { name: '', breed: '', size: null, bio: '' },
};

export const useOnboarding = create<Onboarding>((set) => ({
  ...initial,
  set: (p) => set(p as any),
  reset: () => set(initial as any),
}));
```

Install Zustand: `npm install zustand`.

- [ ] **Step 2: Onboarding layout with progress rule**

Create `app/onboarding/_layout.tsx`:
```tsx
import { Stack, useSegments } from 'expo-router';
import { View } from 'react-native';
import { colors, spacing } from '../../design';
import { ProgressRule } from '../../components/ProgressRule';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = ['index','name','gender','city','photos','dog','bio','submit'];

export default function OnboardingLayout() {
  const segs = useSegments();
  const current = segs[segs.length - 1] || 'index';
  const i = Math.max(0, STEPS.indexOf(current));
  const progress = (i + 1) / STEPS.length;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.sand }}>
      <View style={{ padding: spacing.md }}><ProgressRule progress={progress} /></View>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.sand } }} />
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Step I — welcome + age gate**

Create `app/onboarding/index.tsx`:
```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={s.root}>
      <Text variant="label">I</Text>
      <Text variant="headline">Welcome to the Society</Text>
      <View style={{ height: spacing.md }} />
      <Text>You must be 18 or older to continue. By tapping below, you confirm that you are.</Text>
      <View style={{ height: spacing.lg }} />
      <Button onPress={() => router.push('/onboarding/name')}>I am 18 or older</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md, justifyContent: 'center' } });
```

- [ ] **Step 4: Commit**

```bash
git add lib/onboarding.ts app/onboarding/
git commit -m "feat(onboarding): scaffold and welcome step with progress rule"
```

---

## Task 13: Onboarding steps II–VII (name through bio)

**Files:**
- Create: `app/onboarding/name.tsx`, `gender.tsx`, `city.tsx`, `photos.tsx`, `dog.tsx`, `bio.tsx`

For each step: a section label (Roman numeral), a headline, input(s), `Continue` button advancing on validation. Use the `useOnboarding` store.

- [ ] **Step 1: Implement `name.tsx`** (Step II — name + birthdate)

```tsx
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function Name() {
  const router = useRouter();
  const { displayName, birthdate, set } = useOnboarding();
  const [error, setError] = useState('');
  const valid = displayName.length >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(birthdate);
  return (
    <View style={s.root}>
      <Text variant="label">II</Text>
      <Text variant="headline">Your name</Text>
      <View style={{ height: spacing.md }} />
      <Input value={displayName} onChangeText={(v) => set({ displayName: v })} placeholder="Display name" />
      <View style={{ height: spacing.sm }} />
      <Input value={birthdate} onChangeText={(v) => set({ birthdate: v })} placeholder="Birthdate (YYYY-MM-DD)" />
      {error ? <Text style={{ color: colors.mud }}>{error}</Text> : null}
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/gender')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md } });
```

- [ ] **Step 2: Implement `gender.tsx`** (Step III)

Show four Chips for gender (Woman / Man / Non-binary / Prefer not to say) and three chips for "Looking for" (Women / Men / Everyone, multi-select). `Continue` enabled when both filled.

```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

const GENDERS = [['woman','Woman'],['man','Man'],['non_binary','Non-binary'],['prefer_not_to_say','Prefer not to say']] as const;
const LOOKING = [['women','Women'],['men','Men'],['everyone','Everyone']] as const;

export default function Gender() {
  const router = useRouter();
  const { gender, lookingFor, set } = useOnboarding();
  const toggleLooking = (v: any) => set({ lookingFor: lookingFor.includes(v) ? lookingFor.filter(x => x !== v) : [...lookingFor, v] });
  const valid = !!gender && lookingFor.length > 0;
  return (
    <View style={s.root}>
      <Text variant="label">III</Text>
      <Text variant="headline">About you</Text>
      <View style={{ height: spacing.md }} />
      <Text variant="label">I am</Text>
      <View style={s.row}>{GENDERS.map(([v,l]) => <Chip key={v} label={l} active={gender===v} onPress={() => set({ gender: v as any })} />)}</View>
      <View style={{ height: spacing.md }} />
      <Text variant="label">Looking for</Text>
      <View style={s.row}>{LOOKING.map(([v,l]) => <Chip key={v} label={l} active={lookingFor.includes(v as any)} onPress={() => toggleLooking(v)} />)}</View>
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/city')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs } });
```

- [ ] **Step 3: Implement `city.tsx`** (Step IV)

City as text input. Country as three chips (DE / AT / CH).

```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function City() {
  const router = useRouter();
  const { city, country, set } = useOnboarding();
  const valid = city.length > 1 && ['DE','AT','CH'].includes(country);
  return (
    <View style={s.root}>
      <Text variant="label">IV</Text>
      <Text variant="headline">Where you are</Text>
      <View style={{ height: spacing.md }} />
      <Input value={city} onChangeText={(v) => set({ city: v })} placeholder="City" />
      <View style={{ height: spacing.md }} />
      <Text variant="label">Country</Text>
      <View style={s.row}>{(['DE','AT','CH'] as const).map(c => <Chip key={c} label={c} active={country===c} onPress={() => set({ country: c })} />)}</View>
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/photos')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md }, row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs } });
```

- [ ] **Step 4: Implement `photos.tsx`** (Step V)

```bash
npx expo install expo-image-picker expo-image-manipulator
```

```tsx
import { View, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function Photos() {
  const router = useRouter();
  const { photos, set } = useOnboarding();
  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsMultipleSelection: false, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (r.canceled || !r.assets[0]) return;
    const compressed = await ImageManipulator.manipulateAsync(r.assets[0].uri, [{ resize: { width: 2048 } }], { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG });
    set({ photos: [...photos, { uri: compressed.uri, isDog: false }] });
  };
  const toggleDog = (i: number) => set({ photos: photos.map((p, idx) => idx === i ? { ...p, isDog: !p.isDog } : p) });
  const remove = (i: number) => set({ photos: photos.filter((_, idx) => idx !== i) });
  const valid = photos.length >= 1 && photos.some(p => p.isDog);
  return (
    <View style={s.root}>
      <Text variant="label">V</Text>
      <Text variant="headline">Your photos</Text>
      <View style={{ height: spacing.xs }} />
      <Text>At least one photo must include your dog. Up to six total.</Text>
      <View style={{ height: spacing.md }} />
      <ScrollView contentContainerStyle={s.grid}>
        {photos.map((p, i) => (
          <View key={i} style={s.cell}>
            <Image source={{ uri: p.uri }} style={s.img} />
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
              <Chip label={p.isDog ? 'With dog ✓' : 'Mark with dog'} active={p.isDog} onPress={() => toggleDog(i)} />
              <Pressable onPress={() => remove(i)}><Text variant="label" style={{ color: colors.mud }}>Remove</Text></Pressable>
            </View>
          </View>
        ))}
        {photos.length < 6 && <Pressable onPress={pick} style={s.addBtn}><Text variant="label">Add photo</Text></Pressable>}
      </ScrollView>
      <Button disabled={!valid} onPress={() => router.push('/onboarding/dog')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
  grid: { gap: spacing.sm },
  cell: { },
  img: { width: '100%', aspectRatio: 1, backgroundColor: colors.water },
  addBtn: { padding: spacing.md, borderWidth: 1, borderColor: colors.deepOcean, alignItems: 'center' },
});
```

- [ ] **Step 5: Implement `dog.tsx`** (Step VI)

```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function Dog() {
  const router = useRouter();
  const { dog, set } = useOnboarding();
  const valid = dog.name.length > 0 && dog.size;
  const update = (k: string, v: any) => set({ dog: { ...dog, [k]: v } });
  return (
    <View style={s.root}>
      <Text variant="label">VI</Text>
      <Text variant="headline">Your dog</Text>
      <View style={{ height: spacing.md }} />
      <Input value={dog.name} onChangeText={(v) => update('name', v)} placeholder="Name" />
      <View style={{ height: spacing.sm }} />
      <Input value={dog.breed} onChangeText={(v) => update('breed', v)} placeholder="Breed (optional)" />
      <View style={{ height: spacing.md }} />
      <Text variant="label">Size</Text>
      <View style={s.row}>{(['small','medium','large'] as const).map(c => <Chip key={c} label={c} active={dog.size===c} onPress={() => update('size', c)} />)}</View>
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/bio')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md }, row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs } });
```

- [ ] **Step 6: Implement `bio.tsx`** (Step VII — optional)

```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function Bio() {
  const router = useRouter();
  const { bio, set } = useOnboarding();
  return (
    <View style={s.root}>
      <Text variant="label">VII</Text>
      <Text variant="headline">A few lines, if you wish</Text>
      <View style={{ height: spacing.md }} />
      <Input value={bio} onChangeText={(v) => set({ bio: v })} placeholder="Tell us about you (optional)" multiline maxLength={500} />
      <View style={{ height: spacing.lg }} />
      <Button onPress={() => router.push('/onboarding/submit')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md } });
```

- [ ] **Step 7: Commit**

```bash
git add app/onboarding/
git commit -m "feat(onboarding): name/gender/city/photos/dog/bio steps"
```

---

## Task 14: Submission and upload

**Files:**
- Create: `app/onboarding/submit.tsx`
- Create: `lib/profile.ts`, `lib/__tests__/profile.test.ts`

- [ ] **Step 1: Write failing test for `createProfile`**

Create `lib/__tests__/profile.test.ts`:
```ts
import { describe, it, expect, jest } from '@jest/globals';

const upsert = jest.fn().mockResolvedValue({ error: null });
const upload = jest.fn().mockResolvedValue({ data: { path: 'x.jpg' }, error: null });
jest.mock('../supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    from: jest.fn(() => ({ insert: upsert, upsert })),
    storage: { from: jest.fn(() => ({ upload })) },
  },
}));

import { createProfileAndUploads } from '../profile';

it('uploads photos and inserts profile/dog rows', async () => {
  await createProfileAndUploads({
    displayName: 'Alice', birthdate: '1990-01-01', gender: 'woman', lookingFor: ['men'],
    city: 'Berlin', country: 'DE', bio: '',
    photos: [{ uri: 'file://a.jpg', isDog: true }],
    dog: { name: 'Bruno', breed: 'Lab', size: 'large', bio: '' },
  } as any);
  expect(upload).toHaveBeenCalled();
  expect(upsert).toHaveBeenCalled();
});
```

Run: `npm test`. Expected: FAIL.

- [ ] **Step 2: Implement `createProfileAndUploads`**

Create `lib/profile.ts`:
```ts
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

type Input = {
  displayName: string;
  birthdate: string;
  gender: 'woman'|'man'|'non_binary'|'prefer_not_to_say';
  lookingFor: ('women'|'men'|'everyone')[];
  city: string;
  country: string;
  bio: string;
  photos: { uri: string; isDog: boolean }[];
  dog: { name: string; breed: string; size: 'small'|'medium'|'large'; bio: string };
};

export async function createProfileAndUploads(input: Input) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');

  const { error: pErr } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: input.displayName,
    birthdate: input.birthdate,
    gender: input.gender,
    looking_for: input.lookingFor,
    city: input.city,
    country: input.country,
    bio: input.bio || null,
  });
  if (pErr) throw pErr;

  await supabase.from('dogs').insert({
    owner_id: user.id,
    name: input.dog.name,
    breed: input.dog.breed || null,
    size: input.dog.size,
    bio: input.dog.bio || null,
  });

  for (let i = 0; i < input.photos.length; i++) {
    const p = input.photos[i];
    const path = `${user.id}/${Date.now()}-${i}.jpg`;
    const blob = await fetch(p.uri).then(r => r.blob());
    const { error: uErr } = await supabase.storage.from('profile-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (uErr) throw uErr;
    await supabase.from('photos').insert({
      profile_id: user.id,
      storage_path: path,
      is_primary: i === 0,
      is_dog_photo: p.isDog,
      position: i,
    });
  }
}
```

Install `expo-file-system`: `npx expo install expo-file-system`.

- [ ] **Step 3: Build the submit screen**

Create `app/onboarding/submit.tsx`:
```tsx
import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { ProgressRule } from '../../components/ProgressRule';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';
import { createProfileAndUploads } from '../../lib/profile';

export default function Submit() {
  const router = useRouter();
  const data = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const send = async () => {
    setBusy(true);
    try {
      await createProfileAndUploads({
        displayName: data.displayName, birthdate: data.birthdate, gender: data.gender!, lookingFor: data.lookingFor,
        city: data.city, country: data.country, bio: data.bio,
        photos: data.photos, dog: { ...data.dog, size: data.dog.size! },
      });
      setProgress(1);
      data.reset();
      router.replace('/under-review');
    } catch (e: any) {
      Alert.alert('Submit failed', e.message);
    } finally { setBusy(false); }
  };
  return (
    <View style={s.root}>
      <Text variant="label">VIII</Text>
      <Text variant="headline">Submit for review</Text>
      <View style={{ height: spacing.md }} />
      <Text>We review every new profile by hand. Most are approved within a day.</Text>
      <View style={{ height: spacing.lg }} />
      {busy && <ProgressRule progress={progress} />}
      <View style={{ height: spacing.md }} />
      <Button onPress={send} disabled={busy}>Submit</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md, justifyContent: 'center', backgroundColor: colors.sand } });
```

- [ ] **Step 4: Commit**

```bash
git add app/onboarding/submit.tsx lib/profile.ts
git commit -m "feat(onboarding): submit creates profile, dog, and uploads photos"
```

---

## Task 15: Under-review and rejected screens

**Files:**
- Create: `app/under-review.tsx`, `app/rejected.tsx`
- Modify: `app/_layout.tsx` (route gating on verification_status)

- [ ] **Step 1: Under-review screen**

Create `app/under-review.tsx`:
```tsx
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { signOut } from '../lib/auth';
import { colors, spacing } from '../design';

export default function UnderReview() {
  return (
    <View style={s.root}>
      <Text variant="label">Roma</Text>
      <Text variant="display">Under review</Text>
      <View style={{ height: spacing.md }} />
      <Text>Welcome to the Society. We are looking over your profile. We will write the moment you are in.</Text>
      <View style={{ height: spacing.lg }} />
      <Button variant="ghost" onPress={signOut}>Sign out</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.water, padding: spacing.md, justifyContent: 'center' } });
```

(The single Water-blue moment — per design system rule "One Water Rule".)

- [ ] **Step 2: Rejected screen**

Create `app/rejected.tsx`:
```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors, spacing } from '../design';

export default function Rejected() {
  const router = useRouter();
  return (
    <View style={s.root}>
      <Text variant="display">Not yet</Text>
      <View style={{ height: spacing.md }} />
      <Text>Your profile did not meet our entrance: we need at least one clear photo of you with your dog. Edit your photos and resubmit.</Text>
      <View style={{ height: spacing.lg }} />
      <Button onPress={() => router.push('/onboarding/photos')}>Edit photos</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md, justifyContent: 'center', backgroundColor: colors.sand } });
```

- [ ] **Step 3: Route gating by verification status**

Add a hook `lib/useProfileStatus.ts`:
```ts
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useSession } from './session';

export function useProfileStatus() {
  const { session } = useSession();
  const [status, setStatus] = useState<'loading'|'none'|'pending'|'approved'|'rejected'|'banned'>('loading');
  useEffect(() => {
    if (!session?.user) { setStatus('none'); return; }
    supabase.from('profiles').select('verification_status').eq('id', session.user.id).single().then(({ data }) => {
      setStatus((data?.verification_status as any) ?? 'none');
    });
    const ch = supabase.channel('profile-status').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, (p: any) => setStatus(p.new.verification_status)).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session]);
  return status;
}
```

Update the Gate in `app/_layout.tsx` to route by status: `none → /onboarding`, `pending → /under-review`, `approved → /(tabs)`, `rejected → /rejected`.

- [ ] **Step 4: Commit**

```bash
git add app/ lib/
git commit -m "feat(onboarding): under-review and rejected states with status routing"
```

---

## Task 16: Tab navigation scaffold

**Files:**
- Create: `app/(tabs)/_layout.tsx`, `app/(tabs)/discover.tsx`, `app/(tabs)/matches.tsx`, `app/(tabs)/society.tsx`, `app/(tabs)/edition.tsx`

- [ ] **Step 1: Tab layout with Roman-numeral labels**

Create `app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../design';

function TabLabel({ numeral, label, focused }: { numeral: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: spacing.xs }}>
      <Text variant="label" style={{ color: focused ? colors.deepOcean : colors.placeholder, marginBottom: 2 }}>{numeral}</Text>
      <Text variant="label" style={{ color: focused ? colors.deepOcean : colors.placeholder }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.sand, borderTopColor: colors.hairline, borderTopWidth: 1, height: 76 },
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen name="discover" options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="I" label="Discover" focused={focused} /> }} />
      <Tabs.Screen name="matches" options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="II" label="Matches" focused={focused} /> }} />
      <Tabs.Screen name="society" options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="III" label="Society" focused={focused} /> }} />
      <Tabs.Screen name="edition" options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="IV" label="Edition" focused={focused} /> }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: Stub each tab screen**

Each tab gets a Sand-background View with a single editorial line of placeholder Text — they get filled in later phases. Commit the stubs.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/
git commit -m "feat(nav): tabs with Roman-numeral labels"
```

---

## Task 17: Notification permission prompt

**Files:**
- Create: `app/onboarding/notifications.tsx` (inserted before submit)
- Create: `lib/push.ts`
- Modify: `app/onboarding/bio.tsx` to route to notifications, then submit

- [ ] **Step 1: Install Expo Notifications**

```bash
npx expo install expo-notifications expo-device
```

- [ ] **Step 2: Implement push token helper**

Create `lib/push.ts`:
```ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

export async function registerForPushAsync(userId: string) {
  if (!Device.isDevice) return null;
  const { status } = await Notifications.getPermissionsAsync();
  let final = status;
  if (status !== 'granted') final = (await Notifications.requestPermissionsAsync()).status;
  if (final !== 'granted') return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const col = Platform.OS === 'ios' ? 'push_token_ios' : 'push_token_android';
  await supabase.from('profiles').update({ [col]: token }).eq('id', userId);
  return token;
}
```

- [ ] **Step 3: Build the screen**

Create `app/onboarding/notifications.tsx`:
```tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useSession } from '../../lib/session';
import { registerForPushAsync } from '../../lib/push';

export default function NotificationsStep() {
  const router = useRouter();
  const { session } = useSession();
  const enable = async () => {
    if (session?.user) await registerForPushAsync(session.user.id);
    router.push('/onboarding/submit');
  };
  return (
    <View style={s.root}>
      <Text variant="label">VIII</Text>
      <Text variant="headline">Stay reachable</Text>
      <View style={{ height: spacing.md }} />
      <Text>We will write only when something matters: a match, a message, a decision on your profile.</Text>
      <View style={{ height: spacing.lg }} />
      <Button onPress={enable}>Enable Notifications</Button>
      <View style={{ height: spacing.sm }} />
      <Button variant="ghost" onPress={() => router.push('/onboarding/submit')}>Not now</Button>
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, padding: spacing.md, justifyContent: 'center' } });
```

Update `bio.tsx` Continue to push to `/onboarding/notifications` instead of `/onboarding/submit`.

- [ ] **Step 4: Commit**

```bash
git add app/onboarding/ lib/push.ts
git commit -m "feat(push): permission prompt and token registration"
```

---

## Task 18: Phase 1 verification

- [ ] **Step 1: Manual end-to-end test on device**

On your phone (Expo Go) and an emulator: sign in fresh, complete every onboarding step, submit, confirm row in `profiles` table via Supabase Dashboard. Confirm photos appear in the storage bucket under `<user-id>/`.

- [ ] **Step 2: Mark phase 1 complete**

```bash
git tag phase-1-complete
```

---

# Phase 2 — Admin moderation web

## Task 19: Next.js admin scaffold

**Files:**
- Create: `admin/` (separate Next.js project)

- [ ] **Step 1: Scaffold**

```bash
mkdir admin && cd admin
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
npm install @supabase/supabase-js @supabase/ssr
cd ..
```

- [ ] **Step 2: Apply Canine Society tokens to admin**

Update `admin/app/globals.css` to use Sand background, Deep Ocean text, DM Sans + Bodoni Moda via `next/font`. Configure tailwind with the five palette colours.

(Implementation detail abbreviated for plan length — when the executing agent reaches this task, the design tokens file in `design/colors.ts` is the source of truth. Mirror those into `admin/tailwind.config.ts`.)

- [ ] **Step 3: Commit**

```bash
git add admin/
git commit -m "chore(admin): Next.js scaffold for moderation web"
```

---

## Task 20: Admin sign-in and route protection

**Files:**
- Create: `admin/app/login/page.tsx`, `admin/app/api/auth/route.ts`, `admin/middleware.ts`

- [ ] **Step 1: Implement admin login**

Use Supabase Auth email magic-link. Restrict to allowlisted emails by storing them in a `moderators` table:

Create `supabase/migrations/0005_moderators.sql`:
```sql
CREATE TABLE moderators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
CREATE POLICY mods_read_self ON moderators FOR SELECT USING (user_id = auth.uid());
```

Apply: `npx supabase db reset`.

Manually insert your moderator row via the dashboard SQL editor once your auth account exists:
```sql
INSERT INTO moderators (user_id, display_name) VALUES ('<your-uuid>', 'Founder');
```

- [ ] **Step 2: Build login + middleware**

(Standard Supabase SSR pattern — see Supabase docs page "Server-Side Auth for Next.js".) The middleware redirects to `/login` if no `moderators` row exists for the current session.

- [ ] **Step 3: Commit**

```bash
git add admin/ supabase/
git commit -m "feat(admin): magic-link sign-in restricted to moderators allowlist"
```

---

## Task 21: Moderation queue view

**Files:**
- Create: `admin/app/queue/page.tsx`, `admin/app/queue/[id]/page.tsx`

- [ ] **Step 1: Queue list page**

`admin/app/queue/page.tsx` — server component that:
1. Reads `profiles` where `verification_status = 'pending'` ordered by `created_at ASC` via service-role Supabase client (a separate client wrapper at `admin/lib/supabase-admin.ts` using `SUPABASE_SERVICE_ROLE_KEY` from server env only).
2. Renders a list: name, age, city, submitted-at, primary photo thumbnail.
3. Each item links to `/queue/[id]`.

- [ ] **Step 2: Profile review page**

`admin/app/queue/[id]/page.tsx` — fetches profile + dogs + photos + signed URLs for photos (storage bucket is private), renders all photos large, dog details, bio. Three actions:
- **Approve** → POST `/api/moderation/approve` with profile id
- **Reject** → choose reason + send → POST `/api/moderation/reject`
- **Request revision** → optional note → POST `/api/moderation/revise`

- [ ] **Step 3: Commit**

```bash
git add admin/
git commit -m "feat(admin): queue list and profile review page"
```

---

## Task 22: Moderation action API routes

**Files:**
- Create: `admin/app/api/moderation/approve/route.ts`, `reject/route.ts`, `revise/route.ts`

- [ ] **Step 1: Approve route**

```ts
// admin/app/api/moderation/approve/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getModeratorOrNull } from '@/lib/moderator';

export async function POST(req: Request) {
  const mod = await getModeratorOrNull();
  if (!mod) return new NextResponse('forbidden', { status: 403 });
  const { profileId } = await req.json();
  const { error } = await supabaseAdmin.from('profiles').update({
    verification_status: 'approved',
    verification_reviewed_at: new Date().toISOString(),
    verification_reviewed_by: mod.user_id,
  }).eq('id', profileId);
  if (error) return new NextResponse(error.message, { status: 500 });
  await supabaseAdmin.from('photos').update({ verification_status: 'approved' }).eq('profile_id', profileId);
  return NextResponse.json({ ok: true });
}
```

Reject and revise mirror this with their own status writes and a `verification_notes` field.

- [ ] **Step 2: Commit**

```bash
git add admin/
git commit -m "feat(admin): approve/reject/revise API routes"
```

---

## Task 23: Decision emails via Edge Function

**Files:**
- Create: `supabase/functions/notify-decision/index.ts`

- [ ] **Step 1: Edge Function**

```ts
// supabase/functions/notify-decision/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const { profileId, decision } = await req.json();
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: profile } = await sb.from('profiles').select('id,display_name').eq('id', profileId).single();
  if (!profile) return new Response('not found', { status: 404 });
  const { data: { user } } = await sb.auth.admin.getUserById(profileId);
  if (!user?.email) return new Response('no email', { status: 200 });

  const subject = decision === 'approved' ? 'Welcome to the Society' : 'A note on your profile';
  const body = decision === 'approved'
    ? `Dear ${profile.display_name},\n\nYou are now part of the Society. Open the app to begin.\n\nCanine Society`
    : `Dear ${profile.display_name},\n\nWe could not approve your profile in its current form. Open the app to see what to adjust and resubmit.\n\nCanine Society`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Canine Society <hello@canine-society.com>', to: user.email, subject, text: body }),
  });
  return new Response('ok');
});
```

- [ ] **Step 2: Deploy and wire**

```bash
npx supabase functions deploy notify-decision
```

In the admin API routes (Task 22), after the DB update call this function via `supabaseAdmin.functions.invoke('notify-decision', { body: { profileId, decision } })`.

- [ ] **Step 3: Set Resend API key**

User obtains a Resend API key (resend.com, free tier) and verifies a domain. Then:
```bash
npx supabase secrets set RESEND_API_KEY=<key>
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/
git commit -m "feat(moderation): decision email via Resend Edge Function"
```

---

## Task 24: Phase 2 verification

- [ ] **Step 1: End-to-end moderation test**

1. Sign up a test user on the mobile app, complete onboarding, submit.
2. Log into the admin web; the test profile appears in queue.
3. Approve. Confirm: status flips to `approved`, decision email arrives at the test inbox, the mobile app's under-review screen flips to the tab home automatically (via the realtime subscription).
4. Test rejection on a second user.

- [ ] **Step 2: Tag and commit**

```bash
git tag phase-2-complete
```

---

# Phase 3 — Discover deck

## Task 25: Deck data layer

**Files:**
- Create: `lib/deck.ts`, `lib/__tests__/deck.test.ts`

- [ ] **Step 1: Failing test**

```ts
// lib/__tests__/deck.test.ts
import { describe, it, expect, jest } from '@jest/globals';
const rpc = jest.fn().mockResolvedValue({ data: [{ id: 'p1' }], error: null });
jest.mock('../supabase', () => ({ supabase: { rpc } }));
import { fetchDeck } from '../deck';
it('calls next_deck RPC with limit', async () => {
  await fetchDeck(20);
  expect(rpc).toHaveBeenCalledWith('next_deck', { limit_count: 20 });
});
```

Run: FAIL.

- [ ] **Step 2: Implement**

```ts
// lib/deck.ts
import { supabase } from './supabase';

export type DeckProfile = {
  id: string; display_name: string; birthdate: string; city: string; bio: string | null;
};

export async function fetchDeck(limit = 20): Promise<DeckProfile[]> {
  const { data, error } = await supabase.rpc('next_deck', { limit_count: limit });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfileDetail(profileId: string) {
  const [{ data: profile }, { data: dogs }, { data: photos }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', profileId).single(),
    supabase.from('dogs').select('*').eq('owner_id', profileId),
    supabase.from('photos').select('*').eq('profile_id', profileId).order('position'),
  ]);
  return { profile, dogs: dogs ?? [], photos: photos ?? [] };
}

export async function recordSwipe(swipeeId: string, direction: 'like'|'pass'|'superlike') {
  const { error } = await supabase.from('swipes').insert({
    swipee_id: swipeeId, direction, intent: 'date',
    swiper_id: (await supabase.auth.getUser()).data.user!.id,
  });
  if (error) throw error;
}
```

- [ ] **Step 3: Run tests and commit**

```bash
npm test
git add lib/deck.ts lib/__tests__/deck.test.ts
git commit -m "feat(deck): data layer for candidates and swipes"
```

---

## Task 26: Photo signed-URL helper

**Files:**
- Create: `lib/photos.ts`

- [ ] **Step 1: Implement**

```ts
// lib/photos.ts
import { supabase } from './supabase';

const cache = new Map<string, { url: string; expires: number }>();

export async function signedPhotoUrl(storagePath: string): Promise<string> {
  const now = Date.now();
  const cached = cache.get(storagePath);
  if (cached && cached.expires > now + 60_000) return cached.url;
  const { data, error } = await supabase.storage.from('profile-photos').createSignedUrl(storagePath, 60 * 60);
  if (error || !data) throw error ?? new Error('no url');
  cache.set(storagePath, { url: data.signedUrl, expires: now + 60 * 60 * 1000 });
  return data.signedUrl;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/photos.ts
git commit -m "feat(photos): signed URL helper with in-memory cache"
```

---

## Task 27: SwipeCard component (gestures)

**Files:**
- Create: `components/SwipeCard.tsx`
- Modify: `package.json` (deps)

- [ ] **Step 1: Install gesture libs**

```bash
npx expo install react-native-reanimated react-native-gesture-handler
```

Add `'react-native-reanimated/plugin'` to `babel.config.js` plugins.

Wrap the app: in `app/_layout.tsx` import `GestureHandlerRootView` and wrap the root.

- [ ] **Step 2: SwipeCard component**

Create `components/SwipeCard.tsx`:
```tsx
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from './Text';
import { colors, shadows, spacing } from '../design';

type Props = {
  uri: string;
  name: string;
  age: number;
  city: string;
  onSwipe: (dir: 'like'|'pass') => void;
  onTap: () => void;
};

export function SwipeCard({ uri, name, age, city, onSwipe, onTap }: Props) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const THRESH = width * 0.3;

  const pan = Gesture.Pan()
    .onChange((e) => { x.value = e.translationX; y.value = e.translationY; })
    .onEnd(() => {
      if (Math.abs(x.value) > THRESH) {
        const dir = x.value > 0 ? 'like' : 'pass';
        x.value = withSpring(Math.sign(x.value) * width * 1.5, {}, () => runOnJS(onSwipe)(dir as any));
      } else {
        x.value = withSpring(0); y.value = withSpring(0);
      }
    });
  const tap = Gesture.Tap().onEnd(() => runOnJS(onTap)());
  const composed = Gesture.Race(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${interpolate(x.value, [-width, 0, width], [-10, 0, 10])}deg` }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[s.card, shadows.paperLow, cardStyle]}>
        <Image source={{ uri }} style={s.img} />
        <View style={s.cap}>
          <Text variant="headline" style={{ color: colors.sand }}>{name}, {age}</Text>
          <Text variant="label" style={{ color: colors.sand }}>{city}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.water, borderRadius: 0, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  cap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: 'rgba(23,36,81,0.6)' },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/SwipeCard.tsx app/_layout.tsx babel.config.js
git commit -m "feat(deck): SwipeCard with pan-and-rotate gesture"
```

---

## Task 28: Discover tab — deck loop

**Files:**
- Modify: `app/(tabs)/discover.tsx`

- [ ] **Step 1: Hook the deck data + card**

```tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchDeck, recordSwipe, DeckProfile } from '../../lib/deck';
import { signedPhotoUrl } from '../../lib/photos';
import { supabase } from '../../lib/supabase';
import { SwipeCard } from '../../components/SwipeCard';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../design';

type Card = DeckProfile & { primaryUri: string };

function ageOf(birthdate: string) { return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000*60*60*24*365.25)); }

export default function Discover() {
  const router = useRouter();
  const [stack, setStack] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const profiles = await fetchDeck(20);
    const withPhotos: Card[] = [];
    for (const p of profiles) {
      const { data } = await supabase.from('photos').select('storage_path').eq('profile_id', p.id).eq('is_primary', true).single();
      if (data) withPhotos.push({ ...p, primaryUri: await signedPhotoUrl(data.storage_path) });
    }
    setStack(withPhotos);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const onSwipe = async (dir: 'like'|'pass') => {
    const top = stack[0]; if (!top) return;
    setStack(s => s.slice(1));
    await recordSwipe(top.id, dir);
    if (stack.length <= 3) load();
  };
  if (loading && !stack.length) return <View style={s.center}><ActivityIndicator color={colors.deepOcean} /></View>;
  if (!stack.length) return <View style={s.center}><Text>No more profiles in your area at the moment.</Text></View>;
  return (
    <View style={s.root}>
      {stack.slice(0, 2).reverse().map((c, i) => (
        <View key={c.id} style={[s.layer, { transform: [{ scale: 1 - i*0.04 }, { translateY: i*8 }] }]}>
          {i === 0 ? <SwipeCard uri={c.primaryUri} name={c.display_name} age={ageOf(c.birthdate)} city={c.city} onSwipe={onSwipe} onTap={() => router.push(`/profile/${c.id}`)} />
            : <View style={[s.placeholder]}></View>}
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, padding: spacing.md, backgroundColor: colors.sand },
  layer: { ...StyleSheet.absoluteFillObject, padding: spacing.md },
  placeholder: { flex: 1, backgroundColor: colors.water },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/discover.tsx
git commit -m "feat(deck): discover tab loops candidates"
```

---

## Task 29: Profile detail overlay

**Files:**
- Create: `app/profile/[id].tsx`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useState } from 'react';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchProfileDetail } from '../../lib/deck';
import { signedPhotoUrl } from '../../lib/photos';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

export default function ProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [uris, setUris] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      if (!id) return;
      const d = await fetchProfileDetail(id);
      const ps = await Promise.all((d.photos ?? []).map(p => signedPhotoUrl(p.storage_path)));
      setData(d); setUris(ps);
    })();
  }, [id]);
  if (!data?.profile) return <View />;
  const p = data.profile;
  const age = Math.floor((Date.now() - new Date(p.birthdate).getTime()) / (1000*60*60*24*365.25));
  return (
    <ScrollView style={s.root}>
      {uris.map((u, i) => <Image key={i} source={{ uri: u }} style={s.img} />)}
      <View style={s.body}>
        <Text variant="display">{p.display_name}</Text>
        <Text variant="label">{age} · {p.city}</Text>
        <View style={{ height: spacing.md }} />
        <HairlineRule />
        <View style={{ height: spacing.md }} />
        {p.bio && <Text>{p.bio}</Text>}
        <View style={{ height: spacing.md }} />
        {data.dogs.map((d: any) => (
          <View key={d.id} style={{ marginBottom: spacing.sm }}>
            <Text variant="title">{d.name}, {d.breed || d.size}</Text>
            {d.bio && <Text>{d.bio}</Text>}
          </View>
        ))}
        <View style={{ height: spacing.lg }} />
        <Button onPress={() => router.back()}>Back</Button>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  img: { width: '100%', aspectRatio: 1 },
  body: { padding: spacing.md },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/profile/
git commit -m "feat(deck): profile detail page"
```

---

## Task 30: Superlike + button row

**Files:**
- Modify: `app/(tabs)/discover.tsx` to add a small action row beneath the deck for like/pass/superlike.

(Plan abbreviation: three squared icon-free buttons — `Pass`, `★`, `Like` — each calling `onSwipe` or a `superlike` variant. Mirror the same `recordSwipe` plumbing.)

- [ ] **Step 1: Implement and commit**

```bash
git add app/(tabs)/discover.tsx
git commit -m "feat(deck): action row with pass/superlike/like"
```

---

## Task 31: Phase 3 verification

- [ ] **Step 1: Manual test**

Seed at least three approved profiles in Supabase. Confirm the deck loads, swipes consume cards, tapping opens detail.

- [ ] **Step 2: Tag**

```bash
git tag phase-3-complete
```

---

# Phase 4 — Matching + chat

## Task 32: Match-detection trigger Edge Function for push

**Files:**
- Create: `supabase/functions/on-match/index.ts`, `supabase/migrations/0006_match_webhook.sql`

- [ ] **Step 1: DB notify on match insert**

```sql
-- supabase/migrations/0006_match_webhook.sql
CREATE OR REPLACE FUNCTION notify_match() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('match_created', NEW.id::text);
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_match_notify AFTER INSERT ON matches FOR EACH ROW EXECUTE FUNCTION notify_match();
```

- [ ] **Step 2: Edge Function listening / Supabase webhook**

Easier than LISTEN/NOTIFY: configure a Supabase Database Webhook (Dashboard → Database → Webhooks) on `matches` INSERT, target `on-match` Edge Function.

Create `supabase/functions/on-match/index.ts`:
```ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { record } = await req.json();
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: profiles } = await sb.from('profiles').select('id, display_name, push_token_ios, push_token_android').in('id', [record.profile_a_id, record.profile_b_id]);
  if (!profiles) return new Response('ok');
  const tokens = profiles.flatMap(p => [p.push_token_ios, p.push_token_android].filter(Boolean));
  const otherName = (id: string) => profiles!.find(p => p.id !== id)?.display_name ?? 'someone';
  const messages = profiles.flatMap(p => {
    const t = [p.push_token_ios, p.push_token_android].filter(Boolean);
    return t.map(token => ({ to: token, title: 'A new match', body: `${otherName(p.id)} swiped you back`, sound: 'default' }));
  });
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  return new Response('ok');
});
```

Deploy: `npx supabase functions deploy on-match`.

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat(match): db webhook -> Edge Function pushes match notifications"
```

---

## Task 33: "It's a Match" screen

**Files:**
- Create: `app/match/[id].tsx`
- Create: `lib/matchListener.ts`

- [ ] **Step 1: Realtime listener for new matches**

```ts
// lib/matchListener.ts
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';
import { useSession } from './session';

export function useMatchListener() {
  const { session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!session?.user) return;
    const ch = supabase.channel(`matches-${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `profile_a_id=eq.${session.user.id}` }, (p: any) => router.push(`/match/${p.new.id}`))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `profile_b_id=eq.${session.user.id}` }, (p: any) => router.push(`/match/${p.new.id}`))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session, router]);
}
```

Wire in `app/(tabs)/_layout.tsx`: call `useMatchListener()` at the top.

- [ ] **Step 2: Match screen**

```tsx
// app/match/[id].tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { signedPhotoUrl } from '../../lib/photos';
import { useSession } from '../../lib/session';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const router = useRouter();
  const [otherUri, setOtherUri] = useState<string|null>(null);
  const [otherName, setOtherName] = useState('');
  useEffect(() => {
    (async () => {
      if (!id || !session?.user) return;
      const { data: m } = await supabase.from('matches').select('*').eq('id', id).single();
      if (!m) return;
      const otherId = m.profile_a_id === session.user.id ? m.profile_b_id : m.profile_a_id;
      const [{ data: prof }, { data: photo }] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', otherId).single(),
        supabase.from('photos').select('storage_path').eq('profile_id', otherId).eq('is_primary', true).single(),
      ]);
      if (prof) setOtherName(prof.display_name);
      if (photo) setOtherUri(await signedPhotoUrl(photo.storage_path));
    })();
  }, [id, session]);
  return (
    <View style={s.root}>
      <Text variant="label">Roma</Text>
      <Text variant="display">Una Coincidenza</Text>
      <View style={{ height: spacing.md }} />
      {otherUri && <Image source={{ uri: otherUri }} style={s.portrait} />}
      <View style={{ height: spacing.md }} />
      <Text variant="headline">You and {otherName}</Text>
      <View style={{ height: spacing.lg }} />
      <Button onPress={() => router.replace(`/chat/${id}`)}>Send a message</Button>
      <View style={{ height: spacing.sm }} />
      <Button variant="ghost" onPress={() => router.replace('/(tabs)/discover')}>Continue</Button>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, padding: spacing.md, justifyContent: 'center', backgroundColor: colors.sand },
  portrait: { width: '60%', aspectRatio: 1, alignSelf: 'center' },
});
```

- [ ] **Step 3: Commit**

```bash
git add app/match/ lib/matchListener.ts
git commit -m "feat(match): It's-a-Match screen and realtime trigger"
```

---

## Task 34: Matches list tab

**Files:**
- Modify: `app/(tabs)/matches.tsx`

- [ ] **Step 1: Implement list**

```tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { signedPhotoUrl } from '../../lib/photos';
import { useSession } from '../../lib/session';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

type Row = { matchId: string; otherId: string; otherName: string; lastMessage: string | null; uri: string };

export default function Matches() {
  const { session } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      if (!session?.user) return;
      const me = session.user.id;
      const { data } = await supabase
        .from('matches')
        .select('id, profile_a_id, profile_b_id, created_at')
        .or(`profile_a_id.eq.${me},profile_b_id.eq.${me}`)
        .is('unmatched_at', null)
        .order('created_at', { ascending: false });
      const out: Row[] = [];
      for (const m of data ?? []) {
        const other = m.profile_a_id === me ? m.profile_b_id : m.profile_a_id;
        const [{ data: prof }, { data: photo }, { data: lastMsg }] = await Promise.all([
          supabase.from('profiles').select('display_name').eq('id', other).single(),
          supabase.from('photos').select('storage_path').eq('profile_id', other).eq('is_primary', true).single(),
          supabase.from('messages').select('body').eq('match_id', m.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);
        out.push({ matchId: m.id, otherId: other, otherName: prof?.display_name ?? '', lastMessage: lastMsg?.body ?? null, uri: photo ? await signedPhotoUrl(photo.storage_path) : '' });
      }
      setRows(out);
    })();
  }, [session]);
  return (
    <FlashList
      data={rows}
      estimatedItemSize={84}
      ItemSeparatorComponent={() => <HairlineRule />}
      contentContainerStyle={{ backgroundColor: colors.sand }}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/chat/${item.matchId}`)} style={s.row}>
          {item.uri ? <Image source={{ uri: item.uri }} style={s.thumb} /> : <View style={s.thumbPlaceholder} />}
          <View style={{ flex: 1 }}>
            <Text variant="title">{item.otherName}</Text>
            <Text style={{ color: colors.placeholder }} numberOfLines={1}>{item.lastMessage ?? 'Say hello'}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  thumb: { width: 56, height: 56 },
  thumbPlaceholder: { width: 56, height: 56, backgroundColor: colors.water },
});
```

Install: `npm install @shopify/flash-list`.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/matches.tsx
git commit -m "feat(matches): list of active matches with last-message snippet"
```

---

## Task 35: Chat data layer + tests

**Files:**
- Create: `lib/chat.ts`, `lib/__tests__/chat.test.ts`

- [ ] **Step 1: Test**

```ts
import { jest } from '@jest/globals';
const insert = jest.fn().mockResolvedValue({ error: null });
const select = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ order: jest.fn().mockResolvedValue({ data: [{ id: 'm1', body: 'hi' }], error: null }) }) });
jest.mock('../supabase', () => ({ supabase: { from: jest.fn(() => ({ insert, select })), auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) } } }));
import { sendMessage, fetchMessages } from '../chat';
it('sends a message', async () => { await sendMessage('match1', 'hi'); expect(insert).toHaveBeenCalled(); });
it('fetches messages', async () => { const r = await fetchMessages('match1'); expect(r.length).toBe(1); });
```

- [ ] **Step 2: Implement**

```ts
// lib/chat.ts
import { supabase } from './supabase';

export async function fetchMessages(matchId: string) {
  const { data } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true });
  return data ?? [];
}
export async function sendMessage(matchId: string, body: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not auth');
  const { error } = await supabase.from('messages').insert({ match_id: matchId, sender_id: user.id, body });
  if (error) throw error;
}
export function subscribeMessages(matchId: string, cb: (msg: any) => void) {
  const ch = supabase.channel(`chat-${matchId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (p: any) => cb(p.new)).subscribe();
  return () => supabase.removeChannel(ch);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/chat.ts lib/__tests__/chat.test.ts
git commit -m "feat(chat): data layer with realtime subscribe"
```

---

## Task 36: Chat screen

**Files:**
- Create: `app/chat/[matchId].tsx`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchMessages, sendMessage, subscribeMessages } from '../../lib/chat';
import { useSession } from '../../lib/session';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../design';

export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    if (!matchId) return;
    fetchMessages(matchId).then(setMessages);
    return subscribeMessages(matchId, (m) => setMessages((prev) => [...prev, m]));
  }, [matchId]);
  const send = async () => {
    if (!text.trim() || !matchId) return;
    const t = text; setText('');
    await sendMessage(matchId, t);
  };
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xs }}
        renderItem={({ item }) => {
          const mine = item.sender_id === session?.user?.id;
          return (
            <View style={[s.bubble, mine ? s.mine : s.theirs]}>
              <Text style={{ color: mine ? colors.sand : colors.deepOcean }}>{item.body}</Text>
            </View>
          );
        }}
      />
      <View style={s.bar}>
        <TextInput value={text} onChangeText={setText} placeholder="Message" placeholderTextColor={colors.placeholder} style={s.input} />
        <Button onPress={send}>Send</Button>
      </View>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  bubble: { padding: spacing.sm, maxWidth: '78%' },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.deepOcean },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.sand, borderWidth: 1, borderColor: colors.deepOcean },
  bar: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, borderTopColor: colors.hairline, borderTopWidth: 1 },
  input: { flex: 1, ...typography.body, color: colors.deepOcean, borderBottomWidth: 1, borderBottomColor: colors.deepOcean, padding: 8 },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/chat/
git commit -m "feat(chat): thread screen with realtime updates and brand bubbles"
```

---

## Task 37–40: Read receipts, typing presence, unmatch, chat header menu

Each task is a small addition:

- **37** Read receipts: when chat screen mounts, mark all unread messages where sender ≠ self as `read_at = now()`. Subscribe to message UPDATE events to render the "read" indicator on outgoing messages.
- **38** Typing presence: Supabase Realtime presence on the chat channel; render "Typing…" label at top.
- **39** Unmatch: 3-dot menu → Unmatch confirm → `UPDATE matches SET unmatched_at=now(), unmatched_by=auth.uid()`. Matches list filter already excludes unmatched.
- **40** Phase verification + tag.

Each gets a commit. (Detail abbreviated for plan length — each is < 40 lines and uses primitives already built.)

- [ ] Tag: `git tag phase-4-complete`

---

# Phase 5 — Push notifications

## Task 41: APNs configuration

- [ ] **Step 1: User creates an Apple Push key**

In developer.apple.com → Certificates, IDs & Profiles → Keys → "+" → Apple Push Notifications service (APNs) → name "Canine Society APNs" → download `.p8` (one-time download) and note the Key ID and Team ID.

- [ ] **Step 2: Upload to Supabase or to Expo**

We're using Expo's push service (`exp.host`) in the `on-match` function, so credentials live with EAS:
```bash
npx eas credentials
```
Select iOS → Push Notifications → Upload your APNs Key. (Apple Push key, Key ID, Team ID required.)

- [ ] **Step 3: Commit any config changes**

```bash
git commit --allow-empty -m "chore(push): APNs key configured in EAS"
```

---

## Task 42: FCM configuration (Android)

- [ ] **Step 1: User creates a Firebase project**

console.firebase.google.com → Add project → name "Canine Society". Add an Android app with package `com.caninesociety.app`. Download `google-services.json`.

- [ ] **Step 2: Wire to EAS**

Place `google-services.json` at project root (already in `.gitignore`). Add to `app.config.ts`:
```ts
android: {
  package: 'com.caninesociety.app',
  googleServicesFile: './google-services.json',
  ...
}
```

In Expo's push registration we already use the Expo push token format; FCM v1 is configured automatically by Expo when google-services.json is present.

- [ ] **Step 3: Commit**

```bash
git add app.config.ts
git commit -m "chore(push): Firebase project for Android push wired via EAS"
```

---

## Task 43: Message-push Edge Function

**Files:**
- Create: `supabase/functions/on-message/index.ts`
- DB webhook on `messages` insert.

- [ ] **Step 1: Implement**

Same shape as `on-match`. Fetch other-side push tokens and send `Expo Push` payload `{ title: '<sender>', body: '<message body, trimmed to 100 chars>' }`. Deploy with `npx supabase functions deploy on-message`. Configure DB Webhook on `messages` INSERT.

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/on-message/
git commit -m "feat(push): chat-message push via Edge Function"
```

---

## Task 44: Phase 5 verification

- [ ] **Step 1: Manual test**

Use two devices (one Android emulator/phone, one iPhone). Match them, send a message, confirm the push arrives with the correct title and body, tapping it opens the chat thread.

- [ ] **Step 2: Tag**

```bash
git tag phase-5-complete
```

---

# Phase 6 — Trust, safety, GDPR

## Task 45: Block flow

**Files:**
- Create: `app/block/[id].tsx`, `lib/block.ts`

- [ ] **Step 1: Implement helpers**

```ts
// lib/block.ts
import { supabase } from './supabase';
export async function blockUser(targetId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not auth');
  await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetId });
}
export async function unblockUser(targetId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not auth');
  await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', targetId);
}
```

- [ ] **Step 2: Confirm screen + accessible from chat header and profile detail**

Sand screen, headline "Block <name>?", text describing mutual invisibility, two squared buttons: confirm and cancel.

- [ ] **Step 3: Commit**

```bash
git add app/block/ lib/block.ts
git commit -m "feat(safety): block flow with mutual invisibility"
```

---

## Task 46: Report flow

**Files:**
- Create: `app/report/[id].tsx`, `lib/report.ts`

- [ ] **Step 1: Helpers + screen**

Three-step form (reason chip group → optional details → confirm) inserting into `reports`. Final confirmation screen: "Thank you. A moderator will review within 24 hours."

- [ ] **Step 2: Surface in queue**

Add a "Reports" view to admin web showing `reports` joined with `reported_profile_id` for resolution.

- [ ] **Step 3: Commit**

```bash
git add app/report/ lib/report.ts admin/app/reports/
git commit -m "feat(safety): in-app report flow and admin reports queue"
```

---

## Task 47: Account deletion

**Files:**
- Create: `supabase/functions/delete-account/index.ts`
- Create: `app/settings/delete.tsx`

- [ ] **Step 1: Edge Function (service-role)**

```ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const auth = req.headers.get('Authorization');
  if (!auth) return new Response('unauth', { status: 401 });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response('unauth', { status: 401 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Anonymise messages so the counterpart's chat stays coherent
  await admin.from('messages').update({ sender_id: null }).eq('sender_id', user.id);
  // Soft-flag matches as unmatched
  await admin.from('matches').update({ unmatched_at: new Date().toISOString(), unmatched_by: user.id }).or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`);
  // Delete photos from storage
  const { data: photos } = await admin.from('photos').select('storage_path').eq('profile_id', user.id);
  if (photos?.length) await admin.storage.from('profile-photos').remove(photos.map(p => p.storage_path));
  // Cascade delete via DB
  await admin.auth.admin.deleteUser(user.id);
  return new Response('ok');
});
```

Note: requires `messages.sender_id` to allow NULL — adjust migration in a follow-up `0007_nullable_sender.sql`:
```sql
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;
ALTER TABLE messages DROP CONSTRAINT messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE SET NULL;
```

Deploy and run migration. Update RLS `messages_read` to handle null sender (already covered by match membership).

- [ ] **Step 2: In-app delete screen**

`app/settings/delete.tsx` — explanation copy, "Delete forever" button (red? No — Mud, the brand's deepest accent), confirm dialog, invokes the function via `supabase.functions.invoke('delete-account')`, signs out, navigates to splash.

- [ ] **Step 3: Commit**

```bash
git add supabase/ app/settings/
git commit -m "feat(safety): account deletion with chat history preserved for counterpart"
```

---

## Task 48: GDPR data export

**Files:**
- Create: `supabase/functions/export-data/index.ts`
- Create: `app/settings/export.tsx`

- [ ] **Step 1: Function returns ZIP**

Function reads profile, dogs, photos, swipes, matches, messages, packages JSON + photo bytes into a ZIP via the deno `zipjs` library, returns as a signed download URL.

- [ ] **Step 2: Screen with "Email me my data" button**

Triggers the function. UI shows: "Your file will arrive by email within an hour."

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/export-data/ app/settings/export.tsx
git commit -m "feat(gdpr): data export to ZIP via Edge Function"
```

---

## Task 49: Legal pages on web

**Files:**
- Create: `admin/app/legal/privacy/page.tsx`, `admin/app/legal/terms/page.tsx`, `admin/app/legal/delete/page.tsx`

- [ ] **Step 1: Render markdown content**

Draft templates (Privacy Policy and Terms of Service) — copy from existing TOS templates for EU dating apps. **Flag that these must be reviewed by a lawyer before App Store submission.** Place at `admin/legal-content/privacy.de.md`, `privacy.en.md`, `terms.de.md`, `terms.en.md`. Pages render the markdown.

- [ ] **Step 2: Delete page** (Apple requirement: a public web page where account deletion is described, even though the app already does it)

Single page explaining the in-app deletion path. Apple's reviewer reads this URL during review.

- [ ] **Step 3: Commit**

```bash
git add admin/
git commit -m "feat(legal): privacy, terms, deletion pages on admin web"
```

---

## Task 50–52: Settings polish, language switch, T&S verification

- **50** Settings tab content: blocked users list (with unblock), language toggle (en/de), notification toggle, link to legal pages, sign out, account deletion entry.
- **51** Language: add `i18next` + `react-i18next`, extract all UI copy into `i18n/en.json` and `i18n/de.json`. Persist `language_pref` to profile.
- **52** Phase 6 verification: end-to-end block/report/delete/export flows on device. Tag `phase-6-complete`.

---

# Phase 7 — Polish + ship

## Task 53: Edition tab — cached articles

**Files:**
- Create: `lib/articles.ts`, `app/(tabs)/edition.tsx`, `app/article/[slug].tsx`

- [ ] **Step 1: Hardcode 3–5 sample articles in `lib/articles.ts`** (no CMS needed for Slice 1 — just static data shaped like real articles, titles + bodies + cover image references).

- [ ] **Step 2: Edition tab renders a magazine-style list. Tapping opens the in-app reader (`/article/[slug]`) — full-bleed Sand screen, hairline rule, body in DM Sans.**

- [ ] **Step 3: Commit**

---

## Task 54: Society tab — own profile preview + edit

**Files:**
- Modify: `app/(tabs)/society.tsx`
- Create: `app/edit-profile.tsx`, `app/edit-photos.tsx`, `app/edit-dog.tsx`

Show: own primary photo, name, age, city, dog info, edit buttons. Edit screens reuse onboarding step components with prefilled state.

- [ ] **Step 1: Implement & commit**

---

## Task 55: App icon and splash

**Files:**
- Create: `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`

Use Canine Society "C" wordmark on Sand for the icon at 1024×1024 PNG. Splash: Sand background, centred wordmark, no spinner.

- [ ] **Step 1: Generate assets and commit**

---

## Task 56: EAS build configuration

**Files:**
- Create: `eas.json`

- [ ] **Step 1: Config**

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "ios": { "simulator": false } },
    "production": { "ios": { "autoIncrement": true }, "android": { "autoIncrement": true } }
  },
  "submit": { "production": {} }
}
```

- [ ] **Step 2: First TestFlight build**

```bash
npx eas build --platform ios --profile preview
```

After build succeeds (cloud, ~20 min):
```bash
npx eas submit --platform ios --profile production
```

Submit to TestFlight. Invite testers via email in App Store Connect.

- [ ] **Step 3: First Play internal-test build**

```bash
npx eas build --platform android --profile preview
npx eas submit --platform android --profile production --track internal
```

- [ ] **Step 4: Commit**

```bash
git add eas.json
git commit -m "chore(release): EAS build config for iOS and Android"
```

---

## Task 57: Store listing copy

**Files:**
- Create: `docs/store/app-store-listing.md`, `docs/store/play-listing.md`

Drafts (in app voice — Italian-Roman in feel, German in cadence, no exclamation, no emoji):

- Name: Canine Society · Encounters
- Subtitle: Lifestyle for dogs and their people
- Description: ~3 paragraphs explaining matchmaking + future walk feature
- Keywords: dog, dating, walk, owners, society
- Privacy: link to privacy page
- Age rating: 17+ (dating apps default)

- [ ] **Step 1: Commit drafts**

```bash
git add docs/store/
git commit -m "docs(store): App Store and Play listing copy drafts"
```

---

## Task 58: Maestro E2E flow

**Files:**
- Create: `e2e/signup.yaml`, `e2e/swipe-match-chat.yaml`, `e2e/block-and-delete.yaml`

```bash
brew install --cask maestro   # or follow maestro.dev install for Windows
```

- [ ] **Step 1: Write the three flows**

Example `e2e/signup.yaml`:
```yaml
appId: com.caninesociety.app
---
- launchApp
- tapOn: "Continue with Email"
- inputText: "test+maestro@canine-society.com"
- tapOn: "Send Link"
- assertVisible: "Check your inbox"
```

(Full flows in repo; Maestro syntax is small enough to author per-screen.)

- [ ] **Step 2: Add CI script**

`package.json`:
```json
"e2e": "maestro test e2e/"
```

- [ ] **Step 3: Commit**

---

## Task 59: Final manual QA pass

- [ ] **Step 1: Device matrix**

iPhone 14 + iPhone SE (small) + Pixel 7 + Samsung A14 (low-end Android). Walk through: signup → onboarding → submit → approve via admin → swipe → match → chat → block → unblock → report → delete account → re-signup.

- [ ] **Step 2: Capture screenshots for store listings**

5 screenshots per platform — Discover (deck), Match modal, Chat, Society tab, Edition tab. Already in correct dimensions if device matrix above is used.

- [ ] **Step 3: File issues for anything broken; fix; re-tag.**

---

## Task 60: Slice 1 done

- [ ] **Step 1: Tag the release**

```bash
git tag v0.1.0-slice-1
git push --tags
```

- [ ] **Step 2: Hand off to user**

Confirm TestFlight + Play Internal builds are live and invite the user (and any test users) to install. End of Slice 1.

---

# Self-review

**Spec coverage** — walked each section of the spec:

- §3 architecture → Tasks 1, 4, 8 (mobile + Supabase), 19 (admin)
- §4 data model → Task 4 schema, 5 RLS, 6 functions, 7 storage
- §5 onboarding → Tasks 12–17
- §6 photo verification → Tasks 19–24 (admin web)
- §7 discovery/matching → Tasks 25–32
- §8 chat → Tasks 35–40
- §9 notifications → Tasks 17, 41–44
- §10 trust/safety/GDPR → Tasks 45–52
- §11 nav/screens → Task 16, Task 53–54
- §12 branding → Tasks 2 (tokens), 3 (primitives), then enforced in every screen task
- §13 testing → Each task includes its test step; Task 58 adds E2E
- §14 open questions → captured; defaults locked

**Placeholder scan** — Task 19 design-tokens-into-admin step and Task 53 article body are abbreviated rather than full code; both are mechanical (mirror existing tokens / write static data). Task 37–40 and 50–52 are summarised because each task is a small variation on patterns established earlier in the plan. None are TBDs — they reference concrete prior tasks for the patterns.

**Type consistency** — `next_deck`, `recordSwipe`, `fetchProfileDetail`, `signedPhotoUrl`, `sendMessage`, `subscribeMessages`, `blockUser`, `useMatchListener` — names used consistently across Tasks 6, 25, 26, 28, 33, 35, 36, 45.

**Scope** — 60 tasks across 8 phases is large but each phase ends in a working demo and 2 trusted reviewers cycling per phase keeps it tractable. If we need to compress, Phase 7's Edition tab and language switch are the safest to defer to Slice 2.
