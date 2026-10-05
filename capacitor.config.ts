import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reppit.app',
  appName: 'REPPIT',
  // Assets are bundled into the app from the Next.js static export (`npm run
  // build`). No `server.url` here on purpose: loading a remote site in a
  // WebView risks rejection under Google Play's Minimum Functionality policy
  // and leaves the app broken with no network.
  webDir: 'out',
  plugins: {
    App: {
      appUrlOpen: true
    },
    StatusBar: {
      overlaysWebView: false
    }
  }
};

export default config;
