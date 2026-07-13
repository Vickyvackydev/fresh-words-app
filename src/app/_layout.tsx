import AsyncStorage from "@react-native-async-storage/async-storage";

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
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Image, Text, View } from "react-native";
import { getBaseUrl } from "../api/client";

import AppTabs from "@/components/app-tabs";
import Onboarding from "@/components/onboarding";
import PermissionPrompt from "@/components/permission-prompt";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../../global.css";

const queryClient = new QueryClient();

// Prevent auto hiding splash screen during initialization
SplashScreen.preventAutoHideAsync().catch(() => {});

// InMemory cache for native platforms, localStorage for web
import { AppContext, useApp } from "../context/AppContext";

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
        ];
        const stores = await safeStorage.multiGet(keys);
        const storeMap: Record<string, string | null> = {};
        stores.forEach(([k, v]) => {
          storeMap[k] = v;
        });

        if (storeMap.hasLaunched === "true") setHasLaunched(true);
        if (storeMap.permissionPromptDone === "true")
          setPermissionPromptDone(true);
        if (storeMap.bookmarks) setBookmarks(JSON.parse(storeMap.bookmarks));
        if (storeMap.readingProgress)
          setReadingProgress(JSON.parse(storeMap.readingProgress));
        if (storeMap.notificationsEnabled === "false")
          setNotificationsEnabled(false);
        if (storeMap.notificationTime)
          setNotificationTime(storeMap.notificationTime);
        if (storeMap.fontSize) setFontSize(parseInt(storeMap.fontSize, 10));

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
        setDeviceId(devId);

        // Load offline cached settings
        if (storeMap.appSettings) {
          setAppSettings(JSON.parse(storeMap.appSettings));
        }

        // Fetch settings from server
        try {
          const baseUrl = getBaseUrl();
          const response = await fetch(`${baseUrl}/settings`);
          const json = await response.json();
          if (json.status === "success" && json.data) {
            setAppSettings(json.data);
            await safeStorage.setItem(
              "appSettings",
              JSON.stringify(json.data),
            );
          }
        } catch (fetchErr) {
          console.warn(
            "Failed to fetch settings from server, using cached settings:",
            fetchErr,
          );
        }

        // Sync bookmarks from backend
        try {
          const baseUrl = getBaseUrl();
          const response = await fetch(
            `${baseUrl}/bookmarks?device_id=${devId}`,
          );
          const json = await response.json();
          if (json.status === "success" && Array.isArray(json.data)) {
            const serverBookmarkIds = json.data.map((d: any) => d.id);
            setBookmarks(serverBookmarkIds);
            await safeStorage.setItem(
              "bookmarks",
              JSON.stringify(serverBookmarkIds),
            );
          }
        } catch (syncErr) {
          console.warn(
            "Failed to sync bookmarks from server, using offline bookmarks:",
            syncErr,
          );
        }
      } catch (e) {
        console.error("Storage initialization error:", e);
      } finally {
        setLoading(false);
      }
    };
    initStorage();
  }, []);

  const saveStorageItem = (key: string, value: any) => {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    safeStorage.setItem(key, stringValue);
  };

  const handleSetHasLaunched = (val: boolean) => {
    setHasLaunched(val);
    saveStorageItem("hasLaunched", val);
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
          ) : !permissionPromptDone ? (
            <AppProvider value={contextValue}>
              <PermissionPrompt
                onFinish={() => handleSetPermissionPromptDone(true)}
              />
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
            className="w-24 h-24 rounded-2xl shadow-sm"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-[#FEF3C7] dark:bg-[#252525] justify-center items-center shadow-sm">
            <Text className="text-5xl">🕊️</Text>
          </View>
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
