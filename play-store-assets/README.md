# Play Store Assets

Generated 2026-09-09 from sources in `docs/screenshots/` and `images/`.
Regenerate with the sharp script noted below if the sources change.

| Asset | Size | Play requirement | Status |
|---|---|---|---|
| `icon-512.png` | 512x512 | exactly 512x512, 32-bit PNG | OK |
| `feature-graphic-1024x500.png` | 1024x500 | exactly 1024x500 | resized from 1513x729 |
| `screenshots/*.png` | 800x1600 | each side 320-3840px, longest side at most 2x shortest | padded from 720x1600 |

## Why the screenshots were padded

The originals were 720x1600, a ratio of 2.222:1. Google Play rejects phone
screenshots whose longest side exceeds twice the shortest. Each image was
letterboxed to 800x1600, exactly 2:1, using its own sampled background colour
rgb(25,26,46) so the padding is invisible against the app's dark theme. No
content was cropped or scaled.

## Still needed before submission

- A public privacy policy URL. The content exists in `docs/PRIVACY_POLICY.md`
  and at the `/privacy` route of the deployed site.
- Play Console content rating questionnaire.
- Data safety form. With the offline-only v1 build there is no data collection
  to declare.
