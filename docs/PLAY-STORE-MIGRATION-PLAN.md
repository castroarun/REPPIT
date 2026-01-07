# Play Store Migration Plan

## Current State Analysis

### Existing Storage Layer
- **Profiles**: `localStorage` key `strength_profiles_v2`
- **Workouts**: `localStorage` key `strength_profile_workouts`
- **Preferences**: `theme`, `unit`, `lastVisitedProfile` in localStorage

### Data Models
```typescript
Profile: id, name, age, height, weight, sex, dailySteps, activityLevel, goal, exerciseRatings, createdAt, updatedAt
WorkoutSession: id, date, exerciseId, profileId, sets[]
```

### Pages (5 total)
- `/` - Home (profile list)
- `/profile/new` - Create profile
- `/profile/[id]` - Profile detail
- `/profile/[id]/edit` - Edit profile
- `/profile/[id]/progress` - Progress charts

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Android App (Capacitor)                  │
├─────────────────────────────────────────────────────────────┤
│                     Next.js Static Export                    │
├─────────────────────────────────────────────────────────────┤
│                      Storage Abstraction                     │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │  Local Cache    │◄────sync────►│    Supabase     │       │
│  │  (localStorage) │              │  (PostgreSQL)   │       │
│  └─────────────────┘              └─────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    Auth (Supabase + Google)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Supabase Setup & Database Schema

### 1.1 Create Supabase Project
- Create project at supabase.com
- Note: Project URL and anon key

URL https://[SUPABASE_PROJECT_REF].supabase.co
Anon Key [SUPABASE_ANON_KEY]

OAuth: (Webapp)
Client id [GOOGLE_WEB_CLIENT_ID]
Secret [GOOGLE_CLIENT_SECRET]

OAuth: (Android)
[GOOGLE_ANDROID_CLIENT_ID]

### 1.2 Database Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT,  -- Original localStorage ID for migration
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 100),
  height INTEGER NOT NULL CHECK (height >= 100 AND height <= 250),
  weight NUMERIC(5,1) NOT NULL CHECK (weight >= 30 AND weight <= 300),
  sex TEXT CHECK (sex IN ('male', 'female')),
  daily_steps INTEGER CHECK (daily_steps >= 0 AND daily_steps <= 50000),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain')),
  exercise_ratings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout sessions table
CREATE TABLE public.workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  date DATE NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, exercise_id, date)
);

-- User preferences table
CREATE TABLE public.user_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  weight_unit TEXT DEFAULT 'kg',
  last_visited_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_workout_sessions_profile_id ON public.workout_sessions(profile_id);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(date);
```

### 1.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view own profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Workout sessions policies
CREATE POLICY "Users can view own workouts" ON public.workout_sessions
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own workouts" ON public.workout_sessions
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own workouts" ON public.workout_sessions
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own workouts" ON public.workout_sessions
  FOR DELETE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

---

## Phase 2: Authentication Layer

### 2.1 New Files Structure

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Supabase client initialization
│   │   ├── auth.ts           # Auth functions
│   │   └── types.ts          # Database types
│   └── storage/
│       ├── profiles.ts       # Modified with sync
│       ├── workouts.ts       # Modified with sync
│       └── sync.ts           # Sync service
├── contexts/
│   └── AuthContext.tsx       # Auth state management
└── components/
    └── auth/
        ├── LoginScreen.tsx   # Google Sign-In UI
        └── AuthGuard.tsx     # Route protection
```

### 2.2 Supabase Client (`src/lib/supabase/client.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2.3 Auth Context (`src/contexts/AuthContext.tsx`)

Features:
- Google Sign-In via Supabase
- Session persistence
- Auto-refresh tokens
- Sign out functionality
- Loading states

### 2.4 Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console
2. Configure redirect URLs in Supabase dashboard
3. Enable Google provider in Supabase Auth settings

---

## Phase 3: Offline-First Storage Layer

### 3.1 Storage Abstraction Pattern

```typescript
// src/lib/storage/storageService.ts

interface StorageService {
  // Local operations (immediate)
  getLocal<T>(key: string): T | null
  setLocal<T>(key: string, data: T): void

  // Cloud operations (async)
  syncToCloud(): Promise<void>
  syncFromCloud(): Promise<void>

  // Hybrid operations
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, data: T): Promise<void>
}
```

### 3.2 Sync Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      SYNC FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [User Action] ──► [Write to localStorage] ──► [Queue Sync] │
│                                                              │
│  [App Online] ──► [Process Queue] ──► [Push to Supabase]    │
│                                                              │
│  [App Start] ──► [Pull from Supabase] ──► [Merge Local]     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Conflict Resolution

- **Last-Write-Wins** based on `updatedAt` timestamp
- Local changes marked with `syncStatus: 'pending' | 'synced' | 'conflict'`
- Sync queue persisted in localStorage

### 3.4 Modified Storage Files

**profiles.ts changes:**
```typescript
// Add sync metadata to profile operations
export async function createProfile(data: ProfileInput): Promise<Profile> {
  // 1. Create locally with syncStatus: 'pending'
  const profile = createProfileLocal(data)

  // 2. Queue for cloud sync
  queueSync('profiles', 'create', profile)

  // 3. Attempt immediate sync if online
  if (navigator.onLine) {
    await syncNow()
  }

  return profile
}
```

---

## Phase 4: Capacitor Android Wrapper

### 4.1 Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/app @capacitor/browser
npx cap init "REPPIT" "com.reppit.app"
```

### 4.2 Configure Next.js for Static Export

```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true
  }
}
```

### 4.3 Capacitor Config

```json
// capacitor.config.json
{
  "appId": "com.reppit.app",
  "appName": "REPPIT",
  "webDir": "out",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "App": {
      "appUrlOpen": true
    }
  }
}
```

### 4.4 Android Setup

```bash
npx cap add android
npx cap sync android
```

---

## Phase 5: Play Store Requirements

### 5.1 Required Assets

| Asset | Size | Location |
|-------|------|----------|
| App Icon | 512x512 | `android/app/src/main/res/` |
| Feature Graphic | 1024x500 | Play Console |
| Screenshots | Various | Play Console |
| Privacy Policy | URL | Web hosted |

### 5.2 App Icon Sizes Needed

```
mipmap-mdpi:    48x48
mipmap-hdpi:    72x72
mipmap-xhdpi:   96x96
mipmap-xxhdpi:  144x144
mipmap-xxxhdpi: 192x192
Play Store:     512x512
```

### 5.3 Privacy Policy Requirements

Must include:
- What data is collected (profiles, workouts)
- How data is stored (Supabase, Google Cloud)
- Third-party services (Google Sign-In, Supabase)
- User rights (data export, account deletion)
- Contact information

### 5.4 Account Deletion (Required by Google)

Must implement:
- In-app account deletion option
- Deletes all user data from Supabase
- Confirmation flow
- Grace period option

---

## Implementation Order

### Sprint 1: Foundation (Backend)
1. [ ] Create Supabase project
2. [ ] Run database schema SQL
3. [ ] Configure RLS policies
4. [ ] Set up Google OAuth in Supabase
5. [ ] Install `@supabase/supabase-js`
6. [ ] Create Supabase client file

### Sprint 2: Authentication
1. [ ] Create AuthContext
2. [ ] Build LoginScreen component
3. [ ] Add Google Sign-In button
4. [ ] Handle auth state changes
5. [ ] Add AuthGuard for protected routes
6. [ ] Test login/logout flow

### Sprint 3: Storage Migration
1. [ ] Create sync service
2. [ ] Modify profiles.ts for hybrid storage
3. [ ] Modify workouts.ts for hybrid storage
4. [ ] Add offline queue system
5. [ ] Implement conflict resolution
6. [ ] Add migration for existing localStorage data

### Sprint 4: Android Build
1. [ ] Configure Next.js static export
2. [ ] Install Capacitor
3. [ ] Add Android platform
4. [ ] Configure deep linking for OAuth
5. [ ] Test on Android emulator
6. [ ] Generate signed APK

### Sprint 5: Play Store Prep
1. [ ] Create app icons (all sizes)
2. [ ] Design feature graphic
3. [ ] Take screenshots
4. [ ] Write store listing
5. [ ] Create privacy policy page
6. [ ] Implement account deletion
7. [ ] Complete content rating questionnaire
8. [ ] Submit for review

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@capacitor/core": "^6.x",
    "@capacitor/android": "^6.x",
    "@capacitor/app": "^6.x",
    "@capacitor/browser": "^6.x"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.x"
  }
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabase/client.ts` | NEW | Supabase client |
| `src/lib/supabase/auth.ts` | NEW | Auth functions |
| `src/lib/storage/sync.ts` | NEW | Sync service |
| `src/lib/storage/profiles.ts` | MODIFY | Add cloud sync |
| `src/lib/storage/workouts.ts` | MODIFY | Add cloud sync |
| `src/contexts/AuthContext.tsx` | NEW | Auth state |
| `src/components/auth/LoginScreen.tsx` | NEW | Login UI |
| `src/components/auth/AuthGuard.tsx` | NEW | Route protection |
| `src/app/layout.tsx` | MODIFY | Add AuthProvider |
| `src/app/page.tsx` | MODIFY | Add auth check |
| `src/app/settings/page.tsx` | NEW | Account settings |
| `next.config.js` | MODIFY | Static export |
| `capacitor.config.json` | NEW | Capacitor config |
| `.env.local` | NEW | Environment vars |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Keep localStorage as backup, two-way sync |
| OAuth failures on mobile | Test deep linking thoroughly, fallback to email |
| Sync conflicts | Last-write-wins with timestamp, manual override option |
| Offline for extended periods | Large queue capacity, periodic sync attempts |
| Play Store rejection | Follow all guidelines, thorough testing |

---

## Success Criteria

- [ ] Users can sign in with Google
- [ ] Data syncs across devices
- [ ] App works fully offline
- [ ] Existing localStorage data migrates
- [ ] Android app installs and runs
- [ ] Play Store review approved
