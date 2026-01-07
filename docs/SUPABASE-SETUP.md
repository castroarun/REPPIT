# Supabase Setup Guide for REPPIT

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (from Settings > API)

## 2. Create Database Tables

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ PROFILES TABLE ============
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL,  -- Maps to client-side ID
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  height NUMERIC NOT NULL CHECK (height >= 100 AND height <= 250),
  weight NUMERIC NOT NULL CHECK (weight >= 20 AND weight <= 300),
  sex TEXT CHECK (sex IN ('male', 'female')),
  daily_steps INTEGER CHECK (daily_steps >= 0 AND daily_steps <= 50000),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'athlete')),
  goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain')),
  exercise_ratings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one local_id per user
  UNIQUE(user_id, local_id)
);

-- Index for faster queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- ============ WORKOUT SESSIONS TABLE ============
CREATE TABLE workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  date DATE NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One workout per exercise per day per profile
  UNIQUE(profile_id, exercise_id, date)
);

-- Index for faster queries
CREATE INDEX idx_workouts_profile_id ON workout_sessions(profile_id);
CREATE INDEX idx_workouts_date ON workout_sessions(date);

-- ============ SCORE HISTORY TABLE ============
CREATE TABLE score_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One score per day per profile
  UNIQUE(profile_id, date)
);

CREATE INDEX idx_score_history_profile_id ON score_history(profile_id);

-- ============ ROW LEVEL SECURITY ============

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profiles
CREATE POLICY "Users can view own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Workout sessions: Users can only access workouts for their profiles
CREATE POLICY "Users can view own workouts"
  ON workout_sessions FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workouts"
  ON workout_sessions FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workouts"
  ON workout_sessions FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workouts"
  ON workout_sessions FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Score history: Users can only access scores for their profiles
CREATE POLICY "Users can view own scores"
  ON score_history FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own scores"
  ON score_history FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============ AUTO-UPDATE TIMESTAMPS ============

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## 3. Configure Google OAuth

1. In Supabase Dashboard: **Authentication > Providers > Google**
2. Enable Google provider
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
4. Enter Client ID and Client Secret in Supabase

## 4. Set Environment Variables on Vercel

Go to your Vercel project settings and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
```

## 5. Redeploy

After adding env vars, redeploy your app:
```bash
git push origin main
```

## How Sync Works

The app uses an **offline-first** approach:

1. **Local First**: All changes save to localStorage instantly (no lag)
2. **Background Queue**: Changes are queued for cloud sync
3. **Auto-Sync**: When online + logged in, queue processes automatically
4. **Network Listener**: `navigator.onLine` triggers sync when connection restored
5. **Conflict Resolution**: Last-write-wins based on `updatedAt` timestamp

This means:
- App works perfectly offline
- No waiting for network on save
- Data syncs in background when possible
- Login required for cloud backup
