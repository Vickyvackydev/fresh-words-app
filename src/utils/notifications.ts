import { Platform } from 'react-native';
import Constants from 'expo-constants';

let Notifications: any = null;
try {
  const isExpoGo = Constants.appOwnership === 'expo';
  if (!(Platform.OS === 'android' && isExpoGo)) {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.warn("Failed to load expo-notifications:", e);
}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });
}

export async function scheduleDailyNotifications(
  appSettings: any,
  offlineDevotionals: Record<string, any[]>,
  customTime?: string
) {
  if (!Notifications) {
    console.warn("Notifications is disabled in Expo Go Android. Skipping scheduling.");
    return;
  }

  // 1. Request notification permission
  const settings = (await Notifications.getPermissionsAsync()) as any;
  if (!settings.granted && settings.canAskAgain) {
    await Notifications.requestPermissionsAsync();
  }

  // 2. Cancel existing local notification triggers
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!appSettings) return;

  const categories = [
    {
      name: "Daily Deliverance",
      enabled: appSettings.daily_deliverance_enabled,
      time: customTime || appSettings.daily_deliverance_time || "08:00 AM",
    },
    {
      name: "Holiness",
      enabled: appSettings.holiness_enabled,
      time: customTime || appSettings.holiness_time || "09:00 AM",
    },
    {
      name: "Prayer",
      enabled: appSettings.prayer_enabled,
      time: customTime || appSettings.prayer_time || "08:30 AM",
    },
    {
      name: "Yearly Devotional",
      enabled: appSettings.yearly_devotional_enabled,
      time: customTime || appSettings.yearly_devotional_time || "08:00 AM",
    },
  ];

  const now = new Date();

  for (const cat of categories) {
    if (!cat.enabled) continue;

    const list = offlineDevotionals[cat.name] || [];
    if (list.length === 0) continue;

    const { hour, minute } = parseTimeStr(cat.time);

    // Schedule next 7 days of daily devotional notifications
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const scheduledDate = new Date();
      scheduledDate.setDate(now.getDate() + dayOffset);
      scheduledDate.setHours(hour);
      scheduledDate.setMinutes(minute);
      scheduledDate.setSeconds(0);
      scheduledDate.setMilliseconds(0);

      // If in the past for today, push to tomorrow
      if (scheduledDate.getTime() <= now.getTime()) {
        continue;
      }

      const targetDayOfYear = getDayOfYear(scheduledDate);
      const devIndex = (targetDayOfYear - 1) % list.length;
      const devotional = list[devIndex];

      if (!devotional) continue;

      const diffMs = scheduledDate.getTime() - now.getTime();
      const seconds = Math.floor(diffMs / 1000);
      if (seconds <= 0) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: devotional.title || `Daily ${cat.name}`,
          body: `Today's devotional is ready — Tap to read now`,
          data: {
            category: cat.name,
            devotionalId: devotional.id,
            day: devotional.default_day || (devIndex + 1),
            dayOfYear: targetDayOfYear,
          },
        },
        trigger: {
          type: "timeInterval",
          seconds,
        } as any,
      });
    }
  }
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function parseTimeStr(timeStr: string): { hour: number; minute: number } {
  let hour = 8;
  let minute = 0;
  
  try {
    const isPM = timeStr.toUpperCase().includes("PM");
    const cleanStr = timeStr.toUpperCase().replace("AM", "").replace("PM", "").trim();
    const parts = cleanStr.split(":");
    if (parts.length >= 2) {
      hour = parseInt(parts[0], 10);
      minute = parseInt(parts[1], 10);
      if (isPM && hour < 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
    }
  } catch (e) {
    // fallback
  }
  
  return { hour, minute };
}
