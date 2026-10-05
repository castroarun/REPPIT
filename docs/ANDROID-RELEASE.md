# Building a REPPIT release for Google Play

## One-time setup on a new machine

1. **JDK 21** — `winget install --id EclipseAdoptium.Temurin.21.JDK --exact --silent`
2. **Android SDK** — unzip the command-line tools into
   `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest`, then:
   ```
   sdkmanager --sdk_root=%LOCALAPPDATA%\Android\Sdk platform-tools "platforms;android-36" "build-tools;36.0.0"
   sdkmanager --sdk_root=%LOCALAPPDATA%\Android\Sdk --licenses
   ```
3. **`android/local.properties`** — one line, forward slashes:
   ```
   sdk.dir=C:/Users/<you>/AppData/Local/Android/Sdk
   ```
4. **`android/key.properties`** — never commit this. It is gitignored:
   ```
   storePassword=<from password manager>
   keyPassword=<from password manager>
   keyAlias=reppit-upload
   storeFile=C:/Users/<you>/.android-keystores/reppit-upload.jks
   ```

## Release build

```bash
npm run build          # Next.js static export -> out/
npx cap sync android   # copies out/ into android/app/src/main/assets/public
cd android
./gradlew bundleRelease    # -> app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease  # -> app/build/outputs/apk/release/app-release.apk
```

Upload the `.aab` to Play Console. The `.apk` is only for sideloading to test on
a device.

Bump `versionCode` (and usually `versionName`) in `android/app/build.gradle`
before every upload. Play rejects a duplicate `versionCode`.

## Why the config looks the way it does

- **`output: 'export'`** in `next.config.ts` — the app must ship its own assets.
  Pointing a WebView at a remote URL risks rejection under Play's Minimum
  Functionality policy and breaks the app with no network.
- **`trailingSlash: true`** — makes each route `<route>/index.html`. Capacitor
  serves bundled files from a plain static handler that resolves a directory
  plus index, not an extensionless path like `/profile`.
- **No dynamic route segments** — static export only prerenders ids known at
  build time, and profile ids are runtime UUIDs. Screens take the id from the
  query string instead: `/profile/?id=<uuid>`.
- **No `src/middleware.ts`** — middleware is unsupported under static export.

## Signing key

The upload key lives outside the repo at
`%USERPROFILE%\.android-keystores\reppit-upload.jks`, alias `reppit-upload`,
4096-bit RSA, valid 10000 days. Back it up. Losing it means you cannot ship
updates under the same upload key without a Google-assisted key reset.
