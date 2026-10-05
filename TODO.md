# REPPIT — Pending Work

Cross-session source of truth for open work. Ported from `docs/PROJECT-STATUS.md`
on 2026-09-09, which tracked against a Jira board that is no longer maintained.
The `SPT-*` keys are kept only as historical references — do not expect the board
to exist.

---

## Play Store release (active work — 2026-09-09)

Decisions taken: fresh keystore (app was never published, only APKs on GitHub),
bundle web assets rather than ship a remote-URL WebView, and ship v1 offline-only
with no Supabase credentials.

### Done
- [x] **Static export enabled** — `next.config.ts` now sets `output: 'export'`.
- [x] **Dynamic routes converted to query params** — `/profile/[id]`,
  `/edit`, `/progress`, `/program` became `/profile?id=`, `/profile/edit?id=`,
  `/profile/progress?id=`, `/profile/program?id=`.
  **Why:** static export only prerenders ids known at build time. Real profile
  ids are runtime UUIDs, so every deep link or app-resume hard load hit 404.
  Query params give one static shell per screen that works for any id.
- [x] **Middleware deleted** — incompatible with `output: 'export'`, and it only
  refreshed Supabase cookies that client-side implicit-flow auth does not need.
- [x] **Removed unused `src/lib/supabase/server.ts`** — imported nowhere.
- [x] **Capacitor now bundles assets** — dropped `server.url` from
  `capacitor.config.ts`. **Why:** a WebView pointing at a remote site risks
  rejection under Google Play's Minimum Functionality policy and breaks with no
  network.
- [x] **`android/key.properties` untracked and gitignored.**

- [x] **Build toolchain installed** — Temurin JDK 21 (winget), Android
  cmdline-tools, SDK platform 36, build-tools 36.0.0 at
  `%LOCALAPPDATA%/Android/Sdk`. `android/local.properties` points gradle at it
  and is gitignored.
- [x] **Fresh upload keystore generated** — 4096-bit RSA, 10000-day validity, at
  `%USERPROFILE%/.android-keystores/reppit-upload.jks`, alias `reppit-upload`.
  Outside the repo. Password in `reppit-password.txt` beside it.
- [x] **Version bumped** — versionCode 8 to 9, versionName 1.1.3 to 1.2.0.
- [x] **Play Store assets generated** into `play-store-assets/`.
  **Why:** all 10 source screenshots were 720x1600, a 2.222:1 ratio, which Play
  rejects because the longest side may not exceed twice the shortest. They were
  letterboxed to 800x1600 using each image's own background colour, nothing
  cropped. The feature graphic was 1513x729 and Play needs exactly 1024x500.

- [x] **`trailingSlash: true` added** — each route now builds to
  `<route>/index.html`. **Why:** Capacitor serves bundled files from a plain
  static handler that resolves a directory plus index, not an extensionless
  path like `/profile`. Without this the app would have loaded the home screen
  and then failed on every navigation.
- [x] **Signed AAB and APK built and verified.** versionCode 9, versionName
  1.2.0. Signature confirmed against the new certificate, the bundled
  `capacitor.config.json` carries no `server.url`, and all routes are present
  as bundled assets. Copies in `release/` (gitignored).
- [x] **Release process documented** in `docs/ANDROID-RELEASE.md`.
- [x] **Fixed wrong tech stack in README** — the LAUNCHPAD block claimed
  Flutter, Dart, SQLite and Riverpod. Corrected to the real stack.

### Next
- [ ] **Move the keystore password into a password manager** and delete
  `reppit-password.txt` from disk.
- [ ] **Back up `reppit-upload.jks` somewhere safe.** Losing it means losing the
  ability to ship updates under this upload key.
- [ ] **Enroll in Play App Signing** when creating the Play Console listing.
- [ ] **Test the bundled build on a real device** with airplane mode on. Install
  `release/REPPIT-v1.2.0-versionCode9.apk` by sideloading. This is the one
  remaining unverified step: the bundling was checked by inspecting the APK
  contents and by serving the export locally, but not yet run on Android.
- [ ] **Play Console listing** — copy is ready in `docs/PLAY-STORE-LISTING.md`.
  Note there is a near-duplicate `docs/PLAY_STORE_LISTING.md`; delete one.
- [ ] **Data safety form** — with v1 offline-only, declare no data collection.
- [ ] **Privacy policy URL** — `docs/PRIVACY_POLICY.md` and the `/privacy` route
  exist; the form needs a public URL.

---

## Security

- [ ] **Treat the old keystore password as public.**
  **Why:** `android/key.properties` sat in a public repo from the initial commit
  with `storePassword`, `keyPassword`, and the alias in cleartext. It is now
  untracked, but it remains in git history. The `.jks` was never committed, so
  nobody can sign as you with the password alone.
  **How to apply:** the fresh keystore makes the exposed password worthless, so
  no history rewrite is strictly required. Never reuse that password anywhere.
- [ ] **Optional: purge the password from git history** with `git filter-repo`
  if you want it gone from the public record. Requires a force push.

---

## Repo hygiene

- [ ] **Commit and push the accumulated work** — branch merge plus everything
  in the Play Store section above. Nothing has been pushed yet.
- [ ] **Decide whether `viceral` or `main` is the real default branch.**
  **Why:** the two diverged for months, each holding work the other lacked.
- [ ] **Consider removing the four committed APKs** (~13 MB) from the repo.

## Open bugs

- [ ] **Set suggestions should match actual workout history pattern** (was SPT-61, P2)
  - **What:** The TARGET column recommends weights and reps that do not reflect
    how the user has actually been logging.
  - **Where:** `src/components/strength/WorkoutLogger.tsx`,
    `src/lib/storage/workouts.ts`

- [ ] **30-second timer warning needs a synced double blip** (was SPT-59, P2)
  - **What:** When 30 seconds remain on the rest timer, play a double blip in
    sync with the countdown.

---

## Open features

- [ ] **Reorder by Workout Log toggle**
  - **What:** Auto-reorder exercises based on the order the user logs them.
    Toggle lives in Settings, defaults ON the first time, user-controlled after.
    The chosen order persists to the next session.
  - **Why:** This is the last unbuilt item from the original PRD build list.

- [ ] **Floating timer window when switching to other apps** (was SPT-58, P2)
  - **What:** Keep the rest timer visible as a floating overlay after the user
    leaves the app.
  - **Note:** Android-side work via Capacitor. See `docs/ANDROID_BUILD_GUIDE.md`.

- [ ] **Machine brand logging for workout equipment** (was SPT-63, P2)
  - **What:** Let the user record which brand of machine a lift was performed on,
    since load differs between manufacturers.

---

## Play Console submission checklist (2026-10-05)

The signed bundle is built, verified and ready:
`release/REPPIT-v1.2.0-versionCode9.aab` (versionCode 9, versionName 1.2.0,
targetSdk 36). Verified offline-only: scanned the bundled JavaScript and there
is no project reference and no key inside.

### Before you touch the console

- [ ] **Do not rebuild without deciding on auth first.** `.env.local` now holds
  live Supabase credentials. A static export inlines `NEXT_PUBLIC_*` at build
  time, so any rebuild bakes them in and silently turns the offline-only app
  into one with login and cloud sync. That changes the Data Safety answers and
  adds an account-deletion disclosure. The existing AAB predates that file and
  is clean.
- [ ] **Move the keystore password into a password manager**, then delete
  `~/.android-keystores/reppit-password.txt`. Still sitting in plaintext.
- [ ] **Back up `~/.android-keystores/reppit-upload.jks`.** Losing it costs you
  the ability to ship updates under this upload key.
- [ ] **Commit and push everything.** The entire Play Store conversion is still
  uncommitted.

### In Play Console

1. [ ] **Create the app** — name REPPIT, category Health & Fitness, free,
   default language English. Listing copy is in `docs/PLAY-STORE-LISTING.md`.
2. [ ] **Enroll in Play App Signing** (offered on first upload). Accept it. You
   keep `reppit-upload.jks` as the upload key; Google holds the signing key.
3. [ ] **Store listing assets** — all compliant files are in
   `play-store-assets/`: `icon-512.png`, `feature-graphic-1024x500.png`, and
   10 phone screenshots at 800x1600.
4. [ ] **Privacy policy URL** — `https://reppit-fitness.vercel.app/privacy`
   (confirmed reachable, HTTP 200).
5. [ ] **Data safety form** — with this offline-only build, declare no data
   collected and no data shared. All data stays in on-device storage.
6. [ ] **Content rating questionnaire** — fitness tracker, no objectionable
   content. Expect Everyone.
7. [ ] **Target audience** — adults. Avoid declaring a child audience; it
   triggers Families policy requirements.
8. [ ] **App access** — declare that no login is required, true for this build.
9. [ ] **Government apps / financial / health declarations** — this is a
   general fitness tracker, not a medical app. Do not claim medical function.
10. [ ] **Upload the AAB** and roll out.

### The big timeline question

If your developer account is a **personal** account created after 13 Nov 2023,
Google requires a **closed test with at least 12 testers running continuously
for 14 days** before you can apply for production access. That is a hard gate
and the main thing standing between you and a live listing.

An **organization** account has no such requirement and can go straight to
production review.

- [ ] **Confirm which account type you have**, then either recruit 12 testers
  and start the closed test now, or submit straight to production.

---

## Known pre-existing issues

- [ ] **65 ESLint errors across the codebase**, mostly "calling setState
  synchronously within an effect". These predate the Play Store work and appear
  in about 19 files. Not blocking a release, worth a cleanup pass.

---

## Testing and release

- [ ] **Write the test cases** — Step 3 of the 9-step workflow never completed.
  `docs/TEST-PLAN.csv` exists with 58 cases but the status doc marks the item
  pending. Reconcile the two.
- [ ] **Complete manual testing of all features** (Step 5, in progress)
- [ ] **Test PR detection and level-up flow end to end**
- [ ] **Test smart suggestions accuracy** — overlaps with the SPT-61 bug above.
- [ ] **Verify mobile responsiveness**
- [ ] **Code walkthrough before ship** (Step 7, not started)
- [ ] **Ship** (Step 8, not started)
- [ ] **Time retrospective** (Step 9, not started) — update `docs/DEV-CLOCK.md`
  with actuals.

---

## Environment notes

Running locally without `.env.local` works, but login and cloud sync stay off and
all data lives in browser localStorage. To enable Supabase, create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Set `NEXT_PUBLIC_AUTH_ENABLED=false` to force offline mode even when credentials
are present. See `docs/SUPABASE-SETUP.md`.
