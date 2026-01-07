// PWA Notification utilities for REPPIT

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered');
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Show a workout reminder notification
 */
export async function showWorkoutNotification(
  title: string = 'REPPIT - Workout Active',
  body: string = 'Tap to resume your workout'
): Promise<void> {
  if (!swRegistration) {
    await registerServiceWorker();
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return;
  }

  // Send message to service worker to show notification
  if (swRegistration?.active) {
    swRegistration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body
    });
  }
}

/**
 * Check if the app is installed as PWA
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Check iOS standalone
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isIOSStandalone = (window.navigator as any).standalone === true;

  return isStandalone || isIOSStandalone;
}

/**
 * Check if notifications are supported
 */
export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' &&
         'Notification' in window &&
         'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}
