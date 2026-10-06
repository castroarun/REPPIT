# REPPIT — Play Store submission sheet

Single source of truth for the v1.2.0 listing. Supersedes the two older,
conflicting files (`PLAY-STORE-LISTING.md` and `PLAY_STORE_LISTING.md`), which
both carry stale or wrong values.

## Ready to paste

| Field | Value |
|---|---|
| App name | `REPPIT` |
| Package | `com.reppit.app` |
| Category | Health & Fitness |
| Pricing | Free |
| Privacy policy | `https://reppit-fitness.vercel.app/privacy` (verified live) |
| Website | `https://reppit-fitness.vercel.app` |
| Developer display name | `castronix` |
| Contact email | `arun.castromin@gmail.com` |

### Short description (77 of 80 characters)

```
Track your strength standards. Log workouts. See your progress. Get stronger.
```

### Full description

Use the version in `PLAY-STORE-LISTING.md` under "Full Description". It is
1442 characters, well inside the 4000 limit, and its "No account required -
works offline" line is accurate for this build.

### What's new (release notes for v1.2.0)

```
REPPIT now works completely offline. The whole app lives on your phone, so
your workouts load instantly and nothing breaks when the signal drops at the
gym.

- Works with no internet connection
- Faster screen loading
- More reliable navigation between profiles and progress
```

## Artwork

Play requires screenshots at **exactly 16:9 or 9:16**. An earlier set at
800x1600 was 1:2 and did not qualify. Everything below is exactly 9:16.

| Slot | Folder | Size | Required |
|---|---|---|---|
| App icon | `play-store-assets/icon-512.png` | 512x512 | yes |
| Feature graphic | `play-store-assets/feature-graphic-1024x500.png` | 1024x500 | yes |
| Phone screenshots | `play-store-assets/phone/` | 900x1600 | yes, 2-8 |
| 7-inch tablet | `play-store-assets/tablet7/` | 1080x1920 | yes, up to 8 |
| 10-inch tablet | `play-store-assets/tablet10/` | 1440x2560 | yes, up to 8 |

8 files in each folder, numbered for upload order. All validated: exact 9:16,
within each slot's pixel bounds, largest file 1.3 MB against an 8 MB cap.

Tablet shots are the phone screens centred on a larger canvas with the app's
own background colour. The app is mobile-first, so there is no separate tablet
layout to capture.

### Correction needed in the live listing

The published description says "23 exercises". The app ships **76 exercises
across 6 body parts** (chest, back, shoulders, legs, arms, core), counted from
`src/lib/calculations/strength.ts`. Fix that number, it undersells the app.

## Console answers

| Question | Answer |
|---|---|
| Data collected | None |
| Data shared | None |
| Account required | No, all features work without login |
| Ads | None |
| News app | No |
| Government app | No |
| Medical claims | None. This is a general fitness tracker. |
| Target audience | Adults. Do not tick a child age band. |
| Content rating | Expect Everyone |

## Note on the contact email

Google publishes the contact email on the public listing page, where anyone can
see it and scrapers can harvest it. `arun.castromin@gmail.com` is a personal
address. It works, and you can change it later in Play Console without
resubmitting the app. If the volume ever becomes a nuisance, switch it to a
dedicated address or a Gmail alias.

## Superseded files

`docs/PLAY-STORE-LISTING.md` and `docs/PLAY_STORE_LISTING.md` both predate this
sheet and contain wrong contact details and a dead website link. Keep them only
for the long description text, which this sheet points to. Delete them once the
listing is live.
