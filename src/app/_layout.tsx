import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Image, Linking, Text, TextInput, View } from "react-native";
import { getBaseUrl } from "../api/client";

// Global font scaling cap to prevent OS font size settings from breaking UI layouts
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.maxFontSizeMultiplier = 1.15;

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.maxFontSizeMultiplier = 1.15;

// Safe storage wrapper — prevents app crash when native module is null
// (can happen on first cold-boot in Expo Go before native modules register)
const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // silently ignore — in-memory state still works
    }
  },
  async multiGet(keys: string[]): Promise<readonly [string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch {
      return keys.map((k) => [k, null]);
    }
  },
};

import AppTabs from "@/components/app-tabs";
import Onboarding from "@/components/onboarding";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { Platform } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../../global.css";
import { scheduleDailyNotifications } from "../utils/notifications";
import { MOCK_DEVOTIONALS } from "../db/mockDb";
// InMemory cache for native platforms, localStorage for web
import { AppContext, useApp } from "../context/AppContext";

let Notifications: any = null;
try {
  const isExpoGo = Constants.appOwnership === "expo";
  if (!(Platform.OS === "android" && isExpoGo)) {
    Notifications = require("expo-notifications");
  }
} catch (e) {
  console.warn("Failed to load expo-notifications:", e);
}

const queryClient = new QueryClient();

// Prevent auto hiding splash screen during initialization
SplashScreen.preventAutoHideAsync().catch(() => {});

const CustomLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: "#FDFBF7",
    card: "#FAF8F5",
    text: "#1C1C1E",
    border: "#E0E1E6",
    primary: "#1E40AF",
  },
};

const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: "#121212",
    card: "#1C1C1E",
    text: "#F3F4F6",
    border: "#2E3135",
    primary: "#60A5FA",
  },
};

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const [hasLaunched, setHasLaunched] = useState(false);
  const [permissionPromptDone, setPermissionPromptDone] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState<
    Record<string, number>
  >({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("07:00");
  const [fontSize, setFontSize] = useState(18);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [offlineDevotionals, setOfflineDevotionals] = useState<
    Record<string, any[]>
  >({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [tappedDevotional, setTappedDevotional] = useState<any | null>(null);
  const [userName, setUserNameState] = useState("");
  const [activeDevotionalCategory, setActiveDevotionalCategoryState] =
    useState("Daily Deliverance");
  const [devotionalPrefs, setDevotionalPrefs] = useState<Record<string, boolean>>({
    "Daily Deliverance": true,
    "Holiness": true,
    "Prayer": true,
    "Yearly Devotional": true,
  });

  const handleSetUserName = async (name: string) => {
    setUserNameState(name);
    await safeStorage.setItem("userName", name);
  };

  const handleSetActiveDevotionalCategory = async (category: string) => {
    setActiveDevotionalCategoryState(category);
    await safeStorage.setItem("defaultDevotionalCategory", category);
  };

  const handleSetDevotionalPref = async (category: string, enabled: boolean) => {
    setDevotionalPrefs((prev) => {
      const updated = { ...prev, [category]: enabled };
      safeStorage.setItem("devotionalPrefs", JSON.stringify(updated));
      return updated;
    });
  };

  // Schedule daily reminders offline-first for the user's active default devotional category ONLY
  useEffect(() => {
    if (
      appSettings &&
      Object.keys(offlineDevotionals).length > 0 &&
      notificationsEnabled
    ) {
      scheduleDailyNotifications(
        appSettings,
        offlineDevotionals,
        notificationTime,
        activeDevotionalCategory,
      ).catch((err) => {
        console.warn("Failed to schedule notifications:", err);
      });
    }
  }, [appSettings, offlineDevotionals, notificationsEnabled, notificationTime, activeDevotionalCategory]);

  // Listen for clicked local notifications to route the user
  useEffect(() => {
    if (!Notifications) return;
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const data = response.notification.request.content.data as any;
        if (data && data.devotionalId) {
          const cat = data.category as string;
          const list = (offlineDevotionals as any)[cat] || [];
          const devotional = list.find((d: any) => d.id === data.devotionalId);
          if (devotional) {
            setTappedDevotional(devotional);
          }
        }
      },
    );
    return () => subscription.remove();
  }, [offlineDevotionals]);

  // Handle incoming deep links (e.g. freshwordsapp://devotional/:id or https://freshdevotionals.com/devotional/:id)
  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const match = url.match(/devotional\/([a-f0-9-]+)/i);
      if (match && match[1]) {
        const devId = match[1];
        const allDevs = Object.values(offlineDevotionals).flat();
        const found = allDevs.find((d: any) => d.id === devId);
        if (found) {
          setTappedDevotional(found);
        } else {
          // Attempt to fetch devotional by ID from API
          const baseUrl = getBaseUrl();
          fetch(`${baseUrl}/devotionals/${devId}`)
            .then((res) => res.json())
            .then((json) => {
              if (json && json.success && json.data) {
                setTappedDevotional(json.data);
              }
            })
            .catch((err) => {
              console.warn("Could not fetch deep-linked devotional:", err);
            });
        }
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", (event) =>
      handleUrl(event.url),
    );
    return () => subscription.remove();
  }, [offlineDevotionals]);

  // Check for OTA updates on production start
  useEffect(() => {
    async function checkUpdates() {
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        // Offline or update check failed, continue normally
        console.log("Update check:", e);
      }
    }
    checkUpdates();
  }, []);

  // App loading state
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Load custom Quicksand fonts
  const [fontsLoaded, error] = useFonts({
    "QuickSand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    "QuickSand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
    "QuickSand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
    "QuickSand-Semibold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "QuickSand-Light": require("../assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      // Hide Expo Splash Screen
      SplashScreen.hideAsync().catch(() => {});
      // Wait 1.5s for Custom Peaceful Splash Screen
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, loading]);

  // Initialize storage
  useEffect(() => {
    let currentDeviceId = "";

    const initStorage = async () => {
      try {
        const keys = [
          "hasLaunched",
          "permissionPromptDone",
          "bookmarks",
          "readingProgress",
          "isDark",
          "notificationsEnabled",
          "notificationTime",
          "fontSize",
          "deviceId",
          "appSettings",
          "offlineDevotionals",
          "userName",
          "devotionalPrefs",
          "defaultDevotionalCategory",
        ];
        const stores = await safeStorage.multiGet(keys);
        const storeMap: Record<string, string | null> = {};
        stores.forEach(([k, v]) => {
          storeMap[k] = v;
        });

        if (storeMap.hasLaunched === "true" || storeMap.hasLaunched === "1") {
          setHasLaunched(true);
        }
        if (storeMap.permissionPromptDone === "true")
          setPermissionPromptDone(true);
        if (storeMap.devotionalPrefs)
          setDevotionalPrefs(JSON.parse(storeMap.devotionalPrefs));
        if (storeMap.defaultDevotionalCategory)
          setActiveDevotionalCategoryState(storeMap.defaultDevotionalCategory);
        if (storeMap.bookmarks) setBookmarks(JSON.parse(storeMap.bookmarks));
        if (storeMap.readingProgress)
          setReadingProgress(JSON.parse(storeMap.readingProgress));
        if (storeMap.notificationsEnabled === "false")
          setNotificationsEnabled(false);
        if (storeMap.notificationTime)
          setNotificationTime(storeMap.notificationTime);
        if (storeMap.fontSize) setFontSize(parseInt(storeMap.fontSize, 10));
        if (storeMap.userName) setUserNameState(storeMap.userName);

        let storedDark = storeMap.isDark;
        if (storedDark !== null) {
          const darkVal = storedDark === "true";
          setIsDark(darkVal);
          setColorScheme(darkVal ? "dark" : "light");
        }

        // Generate or retrieve Device ID
        let devId = storeMap.deviceId;
        if (!devId) {
          devId =
            "device_" +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          await safeStorage.setItem("deviceId", devId);
        }
        currentDeviceId = devId;
        setDeviceId(devId);

        // Load offline cached settings & devotionals
        let devsObj: Record<string, any[]> = {};
        let loadedSettings: any = null;
        if (storeMap.appSettings) {
          loadedSettings = JSON.parse(storeMap.appSettings);
          setAppSettings(loadedSettings);
        }
        if (storeMap.offlineDevotionals) {
          try {
            devsObj = JSON.parse(storeMap.offlineDevotionals);
          } catch {
            devsObj = {};
          }
        }

        // If no cached devotionals exist at all, populate from bundled MOCK_DEVOTIONALS as default fallback
        if (!devsObj || Object.keys(devsObj).length === 0) {
          const fallbackMap: Record<string, any[]> = {
            "Daily Deliverance": [],
            "Holiness": [],
            "Prayer": [],
            "Yearly Devotional": [],
          };
          MOCK_DEVOTIONALS.forEach((d) => {
            const cat = d.category || "Daily Deliverance";
            if (!fallbackMap[cat]) fallbackMap[cat] = [];
            fallbackMap[cat].push(d);
          });
          devsObj = fallbackMap;
        }

        setOfflineDevotionals(devsObj);

        // Check if app was launched by tapping a notification
        if (Notifications) {
          try {
            const launchResponse =
              await Notifications.getLastNotificationResponseAsync();
            if (launchResponse) {
              const data = launchResponse.notification.request.content
                .data as any;
              if (data && data.devotionalId) {
                const cat = data.category as string;
                const list = devsObj[cat] || [];
                const devotional = list.find(
                  (d: any) => d.id === data.devotionalId,
                );
                if (devotional) {
                  setTappedDevotional(devotional);
                }
              }
            }
          } catch (launchNotifErr) {
            console.warn(
              "Failed to check last notification launch:",
              launchNotifErr,
            );
          }
        }
      } catch (e) {
        console.error("Storage initialization error:", e);
      } finally {
        // Unlock UI immediately from local storage
        setLoading(false);
      }

      // Background Silent Auto-Sync on App Open (Runs asynchronously without blocking UI or wiping cache)
      const backgroundSync = async () => {
        const fetchWithTimeout = async (url: string, timeoutMs = 3500) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);
          try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            return res;
          } catch (err) {
            clearTimeout(timer);
            throw err;
          }
        };

        // 1. Sync Settings
        try {
          const baseUrl = getBaseUrl();
          const response = await fetchWithTimeout(`${baseUrl}/settings`);
          const json = await response.json();
          if (json.success && json.data) {
            setAppSettings(json.data);
            safeStorage.setItem("appSettings", JSON.stringify(json.data));
          }
        } catch {
          console.log("[Offline Mode] Using cached app settings.");
        }

        // 2. Sync Active Devotionals Packages (Never overwrite with empty array)
        try {
          const baseUrl = getBaseUrl();
          const categories = [
            "Daily Deliverance",
            "Holiness",
            "Prayer",
            "Yearly Devotional",
          ];
          const updatedCache: Record<string, any[]> = {};
          for (const cat of categories) {
            try {
              const res = await fetchWithTimeout(
                `${baseUrl}/packages/active?category=${encodeURIComponent(cat)}`,
                3500,
              );
              const json = await res.json();
              if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                updatedCache[cat] = json.data;
              }
            } catch {
              // ignore single category fetch error offline
            }
          }
          if (Object.keys(updatedCache).length > 0) {
            setOfflineDevotionals((prev) => {
              const merged = { ...prev, ...updatedCache };
              safeStorage.setItem("offlineDevotionals", JSON.stringify(merged));
              return merged;
            });
          }
        } catch {
          console.log("[Offline Mode] Using cached offline devotionals.");
        }

        // 3. Sync Bookmarks
        try {
          if (currentDeviceId) {
            const baseUrl = getBaseUrl();
            const response = await fetchWithTimeout(
              `${baseUrl}/bookmarks?device_id=${currentDeviceId}`,
            );
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
              const serverBookmarkIds = json.data.map((d: any) => d.id);
              if (serverBookmarkIds.length > 0) {
                setBookmarks(serverBookmarkIds);
                safeStorage.setItem(
                  "bookmarks",
                  JSON.stringify(serverBookmarkIds),
                );
              }
            }
          }
        } catch {
          console.log("[Offline Mode] Using local bookmarks.");
        }
      };

      backgroundSync().catch((err) =>
        console.warn("Background auto-sync failed:", err),
      );
    };

    initStorage();
  }, []);

  const saveStorageItem = (key: string, value: any) => {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    safeStorage.setItem(key, stringValue);
  };

  const handleSetHasLaunched = async (val: boolean) => {
    setHasLaunched(val);
    await safeStorage.setItem("hasLaunched", val ? "true" : "false");
  };

  const handleSetPermissionPromptDone = (val: boolean) => {
    setPermissionPromptDone(val);
    saveStorageItem("permissionPromptDone", val);
  };

  const handleSetIsDark = (val: boolean) => {
    setIsDark(val);
    setColorScheme(val ? "dark" : "light");
    saveStorageItem("isDark", val);
  };

  const handleSetNotificationsEnabled = (val: boolean) => {
    setNotificationsEnabled(val);
    saveStorageItem("notificationsEnabled", val);
  };

  const handleSetNotificationTime = (val: string) => {
    setNotificationTime(val);
    saveStorageItem("notificationTime", val);
  };

  const handleSetFontSize = (val: number) => {
    setFontSize(val);
    saveStorageItem("fontSize", val);
  };

  const syncOfflineDevotionals = async () => {
    setIsSyncing(true);
    try {
      const baseUrl = getBaseUrl();
      const categories = [
        "Daily Deliverance",
        "Holiness",
        "Prayer",
        "Yearly Devotional",
      ];
      const updatedCache: Record<string, any[]> = {};
      let successCount = 0;
      let lastError: string | null = null;

      for (const cat of categories) {
        try {
          const res = await fetch(
            `${baseUrl}/packages/active?category=${encodeURIComponent(cat)}`,
          );
          const json = await res.json();
          if (res.ok && json.success && Array.isArray(json.data)) {
            updatedCache[cat] = json.data;
            successCount++;
          } else {
            console.warn(
              `Failed to sync category ${cat}: ${json.message || "Unknown API response"}`,
            );
            if (res.status !== 404) {
              lastError = json.message || `HTTP ${res.status}`;
            }
          }
        } catch (catErr: any) {
          console.warn(`Failed to sync category ${cat}:`, catErr);
          lastError = catErr.message || String(catErr);
        }
      }

      setOfflineDevotionals((prev) => {
        const merged = { ...prev, ...updatedCache };
        const stringValue = JSON.stringify(merged);
        safeStorage.setItem("offlineDevotionals", stringValue);
        return merged;
      });

      if (successCount === 0 && lastError) {
        alert(
          `Sync failed. Please check connection to local backend at ${baseUrl}.\nError: ${lastError}`,
        );
      } else if (successCount > 0) {
        alert(`Successfully synced ${successCount} devotional package(s)!`);
      } else {
        alert(
          "Sync checked successfully, but no active published packages were found in the database. Please publish packages in the admin panel.",
        );
      }
    } catch (err: any) {
      console.error("Failed to sync devotionals:", err);
      alert("Failed to sync devotionals: " + (err.message || String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id];
      saveStorageItem("bookmarks", updated);

      // Asynchronously synchronize bookmark state with backend server
      const baseUrl = getBaseUrl();
      fetch(`${baseUrl}/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: deviceId,
          devotional_id: id,
        }),
      }).catch((e) => {
        console.warn("Background bookmark sync deferred: client offline.", e);
      });

      return updated;
    });
  };

  const saveProgress = (id: string, progress: number) => {
    setReadingProgress((prev) => {
      const updated = { ...prev, [id]: progress };
      saveStorageItem("readingProgress", updated);
      return updated;
    });
  };

  if (loading || !fontsLoaded) {
    return null;
  }

  const contextValue = {
    isDark,
    setIsDark: handleSetIsDark,
    hasLaunched,
    setHasLaunched: handleSetHasLaunched,
    permissionPromptDone,
    setPermissionPromptDone: handleSetPermissionPromptDone,
    bookmarks,
    toggleBookmark,
    readingProgress,
    saveProgress,
    notificationsEnabled,
    setNotificationsEnabled: handleSetNotificationsEnabled,
    notificationTime,
    setNotificationTime: handleSetNotificationTime,
    fontSize,
    setFontSize: handleSetFontSize,
    feedbackSubmitted,
    setFeedbackSubmitted,
    appSettings,
    deviceId,
    offlineDevotionals,
    syncOfflineDevotionals,
    isSyncing,
    userName,
    setUserName: handleSetUserName,
    tappedDevotional,
    setTappedDevotional,
    devotionalPrefs,
    setDevotionalPref: handleSetDevotionalPref,
    activeDevotionalCategory,
    setActiveDevotionalCategory: handleSetActiveDevotionalCategory,
  };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
          {showSplash ? (
            <AppProvider value={contextValue}>
              <PeacefulSplashScreen />
            </AppProvider>
          ) : !hasLaunched ? (
            <AppProvider value={contextValue}>
              <Onboarding onFinish={() => handleSetHasLaunched(true)} />
            </AppProvider>
          ) : (
            <AppProvider value={contextValue}>
              <View
                className={`flex-1 ${isDark ? "dark bg-[#121212]" : "bg-[#FDFBF7]"}`}
              >
                <AppTabs />
              </View>
            </AppProvider>
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// App Provider wrapper to toggle NativeWind class injection
function AppProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: any;
}) {
  return (
    <AppContext.Provider value={value}>
      <View
        className={`flex-1 ${value.isDark ? "dark bg-[#121212]" : "bg-[#FDFBF7]"}`}
      >
        {children}
      </View>
    </AppContext.Provider>
  );
}

// Peaceful Custom Splash Screen
function PeacefulSplashScreen() {
  const insets = useSafeAreaInsets();
  const [logoOpacity] = useState(new Animated.Value(0));
  const [textOpacity] = useState(new Animated.Value(0));
  const { appSettings } = useApp();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212] justify-center items-center px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Animated.View
        style={{ opacity: logoOpacity }}
        className="mb-6 items-center"
      >
        {appSettings?.app_logo_url ? (
          <Image
            source={{ uri: appSettings.app_logo_url }}
            resizeMode="contain"
            className="w-48 h-48"
          />
        ) : (
          <Image
            source={require("../../assets/images/splash-icon.png")}
            resizeMode="contain"
            className="w-48 h-48"
          />
        )}
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity }} className="items-center">
        <Text className="text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#F3F4F6] mb-2 font-serif text-center">
          {appSettings?.church_name
            ? appSettings.church_name.toUpperCase()
            : "FRESH WORDS"}
        </Text>
        <Text className="text-sm font-medium tracking-wide text-[#60646C] dark:text-[#B0B4BA] mb-12 text-center">
          {appSettings?.about_us
            ? appSettings.about_us
            : "Growing with God every day."}
        </Text>
        <ActivityIndicator size="small" color="#1E40AF" />
      </Animated.View>
    </View>
  );
}

function getCategoryTime(settings: any): string {
  if (!settings) return "08:00";
  let rawTime = "08:00 AM";
  if (settings.daily_deliverance_enabled && settings.daily_deliverance_time) {
    rawTime = settings.daily_deliverance_time;
  } else if (
    settings.yearly_devotional_enabled &&
    settings.yearly_devotional_time
  ) {
    rawTime = settings.yearly_devotional_time;
  } else if (settings.holiness_enabled && settings.holiness_time) {
    rawTime = settings.holiness_time;
  } else if (settings.prayer_enabled && settings.prayer_time) {
    rawTime = settings.prayer_time;
  }

  try {
    const isPM = rawTime.toUpperCase().includes("PM");
    const clean = rawTime
      .toUpperCase()
      .replace("AM", "")
      .replace("PM", "")
      .trim();
    const parts = clean.split(":");
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1].padStart(2, "0");
      if (isPM && h < 12) h += 12;
      else if (!isPM && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m}`;
    }
  } catch (e) {}
  return "08:00";
}
