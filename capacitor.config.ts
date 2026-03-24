import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reppit.app',
  appName: 'REPPIT',
  webDir: 'out',
  server: {
    // Production: Load from Vercel
    url: 'https://reppit-fitness.vercel.app',
    androidScheme: 'https'
  },
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
