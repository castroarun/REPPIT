import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the Android build (Capacitor) bundles these files into the
  // APK/AAB so the app runs offline instead of loading a remote URL in a
  // WebView. The same output is what Vercel serves for the web app.
  output: 'export',
  // Emit every route as <route>/index.html rather than <route>.html. Capacitor
  // serves the bundled files from a plain static handler, which resolves a
  // directory + index.html but not an extensionless path like /profile.
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
