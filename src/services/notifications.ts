import * as Notifications from 'expo-notifications';
import { Alarm } from '../types/alarm';
import { nextOccurrence } from '../utils/time';

// IMPORTANT — testing note:
// This MVP uses ONLY local scheduled notifications (no remote/push).
// Expo Go (SDK 53+) removed Android push support and does NOT fully support
// notifications. For reliable alarm testing, run a development build instead:
//   npx expo run:ios      (needs Xcode)
//   npx expo run:android  (needs Android Studio)
// Local notifications still work in the foreground in Expo Go, but background
// firing is only dependable in a dev build.

// Show notifications while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests notification permission if not already granted.
 * Returns true if granted. Never throws.
 */
export async function ensurePermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (err) {
    console.warn('Failed to request notification permission.', err);
    return false;
  }
}

/**
 * Schedules a single local notification for the next occurrence of the alarm time.
 * Returns the notification id, or null on failure.
 *
 * TODO: repeat alarms — when alarm.repeatDays is non-empty, schedule a
 * recurring weekly trigger per selected day instead of a single next occurrence.
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string | null> {
  try {
    const fireDate = nextOccurrence(alarm.time);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: `It's ${alarm.time}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
    return id;
  } catch (err) {
    console.warn('Failed to schedule alarm.', err);
    return null;
  }
}

/** Cancels a scheduled notification. Safe to call with null. */
export async function cancelAlarm(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('Failed to cancel alarm.', err);
  }
}
