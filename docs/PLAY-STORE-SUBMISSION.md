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

| Asset | File | Status |
|---|---|---|
| Icon | `play-store-assets/icon-512.png` | 512x512, ready |
| Feature graphic | `play-store-assets/feature-graphic-1024x500.png` | 1024x500, ready |
| Phone screenshots | `play-store-assets/screenshots-final/` | 8 files, 800x1600, upload in filename order |

Play accepts a maximum of 8 phone screenshots. Two were held back:
`progress-2.png` duplicates the progress view, and
`Settings-and-customizations.png` is the least persuasive. Both remain in
`play-store-assets/screenshots/` if you want to swap one in.

Tablet screenshots are optional. Without them the listing still publishes, but
it may be ranked lower on tablet and Chromebook surfaces.

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
