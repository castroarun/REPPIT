# Release Notes

## v1.x.x - OTP Login Fix (Feb 2026)

### Bug Fix

**Fixed "Code expired or invalid" on first login attempt** - Many users were seeing this error even when entering the correct code immediately.

**Root cause:** Supabase sends both a magic link and OTP code in the same email. Email clients (Gmail, Outlook) prefetch/preview the magic link, which consumes the token and invalidates the OTP before the user reads the email.

**Fixes applied:**
- Switched auth flow from PKCE to implicit (OTP doesn't need PKCE code verification)
- Auto-retry: if first code fails, app automatically sends a fresh code instead of showing a dead-end error
- Updated Supabase email template to remove the magic link (only shows OTP code)

### Google Play Store Description

**Full changelog:**
- Fixed sign-in code failing on first attempt for many users
- Login now auto-sends a fresh code if the first one doesn't work

---

## v1.x.x - Daily Workout Summaries & Calorie Tracking (Feb 2026)

### What's New

**Daily Workout Summaries** - Browse your workout history day by day with full stats, comparisons, and trends.

- **Day-by-day navigation** - Scroll through all your previous workout days with left/right arrows
- **Daily stats at a glance** - Exercises, sets, reps, total volume, and estimated calories burned for each day
- **Day-to-day comparison** - Automatically shows volume and set differences compared to your previous workout
- **Body part volume distribution** - Visual breakdown showing which muscles got the most work each day
- **Daily volume trend chart** - Bar chart showing your total volume across the last 14 workout days
- **Estimated calories burned** - MET-based calorie estimation for every workout (shown in both end-of-session summary and daily summaries)

### How to Access

1. Go to **Progress** page
2. Tap **"Daily Workout Summaries"** (new button above workout history)
3. Navigate between days using the arrow buttons

The end-of-session summary now also shows estimated calories burned.

### Google Play Store Description

**Short description (80 chars):**
New! Browse daily workout summaries with calorie estimates & volume trends.

**Full changelog:**
- Added daily workout summaries: browse your workout history day by day
- New calorie estimation for every workout session (MET-based calculation)
- Day-to-day comparison shows volume and set changes vs previous workout
- Body part volume distribution chart per day
- Daily volume trend bar chart across last 14 workout days
- End-of-session summary now shows estimated calories burned

---

## v1.x.x - Exercise Library Expansion (Feb 2026)

### What's New

**30 new exercises added** - The exercise library has been expanded from 48 to 78 exercises across all body parts, with full male and female strength standards for each.

#### New Chest Exercises (3)
- Dumbbell Fly
- Push-ups
- Incline Dumbbell Fly

#### New Back Exercises (3)
- Chin-ups
- Pendlay Row
- Single-Arm Cable Pulldown

#### New Shoulder Exercises (5)
- Arnold Press
- Upright Row
- Dumbbell Shrug
- Barbell Shrug
- Reverse Pec Deck

#### New Leg Exercises (6)
- Walking Lunge
- Sumo Deadlift
- Seated Calf Raise
- Adductor Machine
- Abductor Machine
- Front Squat

#### New Arm Exercises (8)
- Close-Grip Bench Press
- Concentration Curl
- Tricep Kickback
- Incline Dumbbell Curl
- Reverse Curl (forearms)
- Wrist Curl (forearms)
- EZ Bar Curl
- (existing exercises retained)

#### New Core Exercises (4)
- Decline Sit-up
- Pallof Press
- Kneeling Cable Crunch
- Ab Rollout

### Improvements
- "Full Assessment" badge now dynamically tracks total exercise count
- Coach tips updated with accurate per-body-part exercise counts
- Forearm and trap exercises now available for the first time

### Google Play Store Description

**Short description (80 chars):**
30 new exercises added! Now track 78 exercises across all muscle groups.

**Full changelog:**
- Added 30 new exercises: now 78 total across chest, back, shoulders, legs, arms, and core
- New muscle coverage: forearm exercises (reverse curl, wrist curl) and trap exercises (shrugs) now available
- Added popular gym staples: Arnold Press, Chin-ups, Front Squat, Walking Lunges, Close-Grip Bench, EZ Bar Curl, and more
- Female strength standards included for all new exercises
- Improved badge tracking for exercise completion
