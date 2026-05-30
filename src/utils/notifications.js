// =========================================================================
// CONNECT & PREP - CLIENT PUSH NOTIFICATION MANAGER SERVICE
// =========================================================================

/**
 * Request permission from the browser/OS to display native notifications.
 */
export async function requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('This browser does not support desktop/mobile notifications.');
        return 'unsupported';
    }

    try {
        const permission = await Notification.requestPermission();
        console.log(`[Notification Service] Permission status: ${permission}`);
        return permission;
    } catch (error) {
        console.warn('[Notification Service] Error requesting permission:', error.message || error);
        return 'denied';
    }
}

/**
 * Register the Service Worker for background push events.
 */
export async function registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.warn('[Notification Service] Service Workers are not supported in this browser.');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[Notification Service] Service Worker registered successfully:', registration.scope);
        return registration;
    } catch (error) {
        console.warn('[Notification Service] Service Worker registration failed:', error.message || error);
        return null;
    }
}

/**
 * Display a native device notification.
 * Attempts to use the Service Worker registration first (which is required on mobile browsers/PWAs),
 * and falls back to standard window.Notification constructor.
 * 
 * @param {string} title 
 * @param {object} options 
 */
export async function showLocalNotification(title, options = {}) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }

    if (Notification.permission !== 'granted') {
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') return;
    }

    const defaultOptions = {
        icon: '/assets/mockup.png', // Fallback icon path
        badge: '/assets/mockup.png',
        vibrate: [200, 100, 200],
        ...options
    };

    // 1. Try displaying via Service Worker registration (handles mobile backgrounds & matches native OS push)
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.ready;
            if (reg) {
                await reg.showNotification(title, defaultOptions);
                return;
            }
        } catch (e) {
            console.warn('[Notification Service] Service worker showNotification failed, using fallback:', e);
        }
    }

    // 2. Fallback to standard client-side Notification
    try {
        new Notification(title, defaultOptions);
    } catch (e) {
        console.warn('[Notification Service] Fallback notification failed:', e.message || e);
    }
}
