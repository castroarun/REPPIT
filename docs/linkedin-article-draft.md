# REPPIT — A Strength Tracker Built From the Gym Floor

Two intense years of weight training — not casual gym visits, but disciplined, consistent work. Tracking lifts, following science-based programming, applying progressive overload rigorously, experimenting with routines, and eventually coaching friends at the gym through their own training.

The same questions kept coming up: "Am I lifting enough for my body weight?" "What level am I actually at?" "Why is my bench decent but my squat lagging behind?"

The information exists — StrengthLevel.com publishes body-weight multipliers, research backs progressive overload principles, and any experienced lifter can spot muscle imbalances. But no single app brought all of that together in a way that was simple, personal, and useful mid-workout.

That's where REPPIT comes in! Every strength standard, form cue, and coaching tip in the app comes from hands-on training and science-based study — not generic content.

80% of REPPIT was ideated, designed, and coded on the cloud with Claude Code — during MRT commutes on a mobile browser.

![REPPIT Dashboard — Profile overview with strength score, coach tip, and exercise levels](docs/screenshots/hero-dashboard.jpeg)

---

## The Core Idea: Strength Standards That Scale With You

Every exercise in REPPIT has four levels: **Beginner → Novice → Intermediate → Advanced**. The thresholds aren't fixed numbers — they're multipliers based on your body weight and sex.

**Example:**
- A 75kg male bench pressing 80kg → Intermediate level
- A 60kg female bench pressing 42kg → Intermediate level (adjusted with female-specific multipliers sourced from StrengthLevel.com)

![Strength Standards — Squat card showing level thresholds, PR celebration, warm-up sets, form tip, and workout logger with TARGET column](docs/screenshots/strength-standards.jpeg)

---

## 77 Exercises Across 6 Body Parts

The exercise library covers the full spectrum of strength training:

| Body Part | Exercises | Examples |
|-----------|-----------|----------|
| **Chest** | 10 | Bench Press, Incline Bench, Cable Fly, Pec Deck |
| **Back** | 11 | Deadlift, Barbell Row, Lat Pulldown, Pull-ups |
| **Shoulders** | 12 | Shoulder Press, Side Laterals, Face Pull, Arnold Press |
| **Legs** | 15 | Squat, Leg Press, Romanian Deadlift, Hip Thrust |
| **Arms** | 15 | Bicep Curl, Tricep Pushdown, Hammer Curl, Skull Crushers |
| **Core** | 10 | Hanging Leg Raise, Cable Woodchop, Ab Rollout |

Each exercise has dual multiplier sets (male/female) and four difficulty levels with auto-detection logic.

---

## Smart Workout Intelligence

This is where REPPIT separates from typical loggers.

### Auto-Level Detection
Hit a new PR that crosses the next threshold? The app **automatically upgrades your level**. No manual clicking. It also **downgrades intelligently** — but only if you haven't hit your level threshold in the last 4 workouts. This prevents both knee-jerk downgrades from a single bad session and inflation from retaining outdated levels.

### Smart TARGET Column
The app suggests optimal weights and reps for today based on your actual workout history. It uses **pyramid progression** (heavier weight = fewer reps per set) and respects the **fatigue principle** — it won't suggest more reps in Set 3 than Set 2 at the same weight.

### One-Tap Copy
See a suggestion you like? One tap copies it to today's log. Spend 30 seconds logging a workout, not 5 minutes calculating progression.

![Workout Logger — Shoulder Press with last session, today's input, TARGET suggestions, timer, and warm-up sets](docs/screenshots/workout-logger.jpeg)

---

## 7 Predefined Workout Programs

Built-in routines with balanced exercise distribution:

1. **Push-Pull-Legs** (6 days/week) — Classic split for intermediate lifters
2. **Upper/Lower** (4 days/week) — For busy schedules
3. **Bro Split** (5 days/week) — One body part per day
4. **Full Body** (3 days/week) — Compound focus, minimal equipment
5. **Upper/Lower Strength/Hypertrophy** — Alternates training goals
6. **Custom Routines** — Build your own

Each routine comes with 6-8 pre-selected exercises per day. Users can add any exercise from the full 77-exercise library to any workout day, toggle exercises on/off, and the app remembers your custom selections per routine.

![Training Program — Push-Pull-Legs with Push A (Chest focus) and Pull A (Back focus) workout days, exercise chips with + Add option](docs/screenshots/Training%20program%20setup.jpeg)

---

## Daily Workout Summaries

After each session, REPPIT generates a summary with:
- Exercises completed and sets logged
- Total volume and estimated calorie burn
- Comparison against your previous session
- Volume distribution by body part

![Day Summary — Dec 3 session showing 3 exercises, 9 sets, 5846kg volume, 105 kcal, and volume split by body part](docs/screenshots/EOD%20summary.jpeg)

---

## Progress Visualization

### Muscle Heatmap
A front/back body visualization showing muscle distribution by completed sets. Colour-coded from no activity to heavy — see which muscles are getting work and which are being neglected.

![Muscle Distribution — Front and back body view with completed sets per muscle group, from Glutes (474) to Traps (158)](docs/screenshots/muscle%20heatmap.jpeg)

### Exercise Progression
Line charts tracking weight increases over time for individual exercises. Each chart shows the progression curve with exact weights at each data point and total progress gained.

![Exercise Progression — Deadlift (+2kg), Shoulder Press (+1.5kg), and Barbell Row (+7kg) progression charts over weeks](docs/screenshots/progress%202.jpeg)

---

## The Details That Matter in the Gym

### Smart Rest Timer
- **Per-exercise memory**: Rested 2:30 on Bench Press last time? The timer defaults to 2:30 next time
- Quick presets: 0:30 to 5:00
- ±15s fine-tuning buttons
- Sound + vibration alerts
- Full-screen mode with landscape support — flashes and beeps as rest time runs out so you never miss the cue
- Warning alert configurable (15s, 30s, 45s, 60s before end)
- Auto-start after logging a set
- Keep-screen-on during workouts (wake lock)

![Timer Settings — Default rest presets, sound/vibration alerts, auto-start toggle, keep screen awake, and warning alert options](docs/screenshots/Settings%20and%20customizations.jpeg)

### 8 Achievement Badges
Quality-based, not grind-based:
- First Step (rate your first exercise) → Elite Status (achieve 100 Strength Score)
- No gates requiring you to rate a minimum number of exercises — depth over breadth

### Coaching Tips
Two systems working together:
- **Form cues** — Level-specific tips per exercise, rotating daily. "Pause at bottom for 1-2 seconds to build strength" (intermediate squat), "Pull slack out of bar before lift" (intermediate deadlift).
- **Profile-aware advice** — Detects body part imbalances and guides what to work on next. "Weak shoulders: Focus on shoulders exercises to balance your strength profile."

### 112 Motivational Quotes
Spanning motivation (Schwarzenegger, Bruce Lee), muscle science (hypertrophy, recovery), and benefit facts (mental health, longevity).

---

## UX Decisions

- **Unit toggle**: Seamlessly switch kg ↔ lbs with automatic conversions
- **Dark mode**: For bright gym lighting
- **Offline-first**: All data stays on your phone. No cloud account required, no subscription, no data sales
- **Google sign-in**: Available for cloud sync when online
- **Mobile-first design**: Built for phone-in-hand gym use
- **BMI + Calorie Advisor**: Cut (-500), maintain, or bulk (+300) with exact daily calorie numbers

---

## Coming Next

- **Google Play Store** — coming soon (currently in closed testing)
- **Transformation photo tracker** with ghost overlay for consistent before/after shots
- **Multi-profile support** — track up to 5 family members, gym partners, or clients

---

## The Rough Edges — What Didn't Go Smoothly

Not everything was butter smooth. Three pain points worth sharing:

### Google Authentication
Setting up Google sign-in turned into a multi-day blocker. The OAuth configuration across Supabase, Google Cloud Console, and Capacitor's Android WebView had edge cases that AI-assisted development couldn't resolve directly. Redirect URIs, SHA-1 fingerprints, and deep linking all had to be debugged manually — the kind of platform-specific plumbing where documentation is scattered and error messages are cryptic. Eventually got it working, but it consumed significantly more time than the feature warranted.

### Google Play Closed Testing Requirements
Google requires **at least 12 active testers over 14 consecutive days** with continuous feedback before an app can be approved for production release. For a solo developer without a large beta audience, this is a real hurdle. Recruiting testers who will actively use the app daily for two weeks — not just install and forget — is harder than building the app itself. Still working on meeting this threshold.

### Mobile Web Development Hit a Wall
80% of REPPIT was ideated, designed, and coded on the cloud with Claude Code — during MRT commutes on a mobile browser. It worked brilliantly for most of the build. But towards the tail end of that 80%, the mobile web interface became painfully slow and nearly inoperable. Context windows grew large, responses lagged, and the browser struggled to keep up. The final 20% had to move back to desktop. Cloud-first mobile development is powerful — but it has a ceiling, and I hit it.

These aren't complaints — they're the reality of shipping a real product. The code is the easy part. Distribution is where solo projects get tested.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Mobile | Capacitor 8 (Android builds) |
| Storage | localStorage + IndexedDB |
| Animations | Framer Motion |
| Visualization | react-body-highlighter (muscle heatmap) |
| Hosting | Google Play (Android) |

Built with Claude Code as pair programmer, following a 9-step development workflow with specialized AI agents for requirements, architecture, and test planning.

→ [Read about the 9-step workflow](https://www.linkedin.com/pulse/clarity-clutter-why-ai-assisted-development-needs-arun-castromin-hmxzc/)

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Exercises | 77 across 6 body parts |
| Difficulty levels | 4 with auto-detection |
| Workout programs | 7 predefined + custom |
| Achievement badges | 8 (quality-based) |
| Motivational quotes | 112 across 3 categories |
| PR celebration messages | 10 variations |
| Account required | No (fully functional offline) |

---

## Try It

**Download APK:** [APK_DOWNLOAD_URL]
**Play Store:** Coming soon — currently in closed testing
**GitHub:** https://github.com/castroarun/REPPIT

---

**What's your method for knowing if you're actually getting stronger — or just lifting heavier?**

---

*Built in public. Feedback welcome.*

#buildinpublic #fitness #strengthtraining #nextjs #typescript #pwa #mobiledev
