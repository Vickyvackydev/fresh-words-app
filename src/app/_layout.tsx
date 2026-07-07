import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Text,
  View,
} from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

import AppTabs from "@/components/app-tabs";
import Onboarding from "@/components/onboarding";
import PermissionPrompt from "@/components/permission-prompt";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../../global.css";

// Prevent auto hiding splash screen during initialization
SplashScreen.preventAutoHideAsync().catch(() => {});

// InMemory cache for native platforms, localStorage for web
const memoryCache: Record<string, string> = {};

export const AppContext = createContext<{
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  hasLaunched: boolean;
  setHasLaunched: (launched: boolean) => void;
  permissionPromptDone: boolean;
  setPermissionPromptDone: (done: boolean) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  readingProgress: Record<string, number>;
  saveProgress: (id: string, progress: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationTime: string;
  setNotificationTime: (time: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isSerif: boolean;
  setIsSerif: (serif: boolean) => void;
  feedbackSubmitted: boolean;
  setFeedbackSubmitted: (sub: boolean) => void;
} | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

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
  const [isSerif, setIsSerif] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // App loading state
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        if (Platform.OS === "web") {
          const launched = localStorage.getItem("hasLaunched") === "true";
          const permDone =
            localStorage.getItem("permissionPromptDone") === "true";
          const storedBookmarks = JSON.parse(
            localStorage.getItem("bookmarks") || "[]",
          );
          const storedProgress = JSON.parse(
            localStorage.getItem("readingProgress") || "{}",
          );
          const storedDark = localStorage.getItem("isDark");
          const notify =
            localStorage.getItem("notificationsEnabled") !== "false";
          const notifyTime =
            localStorage.getItem("notificationTime") || "07:00";
          const size = parseInt(localStorage.getItem("fontSize") || "18", 10);
          const serif = localStorage.getItem("isSerif") !== "false";

          setHasLaunched(launched);
          setPermissionPromptDone(permDone);
          setBookmarks(storedBookmarks);
          setReadingProgress(storedProgress);
          setNotificationsEnabled(notify);
          setNotificationTime(notifyTime);
          setFontSize(size);
          setIsSerif(serif);
          if (storedDark !== null) {
            const darkVal = storedDark === "true";
            setIsDark(darkVal);
            // Sync NativeWind color scheme engine with stored preference
            setColorScheme(darkVal ? "dark" : "light");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        // Hide Expo Splash Screen
        SplashScreen.hideAsync().catch(() => {});
        // Wait 1.5s for Custom Peaceful Splash Screen
        setTimeout(() => {
          setShowSplash(false);
        }, 1500);
      }
    };
    initStorage();
  }, []);

  const saveStorageItem = (key: string, value: any) => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(
          key,
          typeof value === "string" ? value : JSON.stringify(value),
        );
      } else {
        memoryCache[key] =
          typeof value === "string" ? value : JSON.stringify(value);
      }
    } catch (e) {
      console.error(e);
    }
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
    // Tell NativeWind's engine to switch dark: variant resolution globally
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

  const handleSetIsSerif = (val: boolean) => {
    setIsSerif(val);
    saveStorageItem("isSerif", val);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id];
      saveStorageItem("bookmarks", updated);
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

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
        {showSplash ? (
          <PeacefulSplashScreen />
        ) : !hasLaunched ? (
          <AppProvider
            value={{
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
              isSerif,
              setIsSerif: handleSetIsSerif,
              feedbackSubmitted,
              setFeedbackSubmitted,
            }}
          >
            <Onboarding onFinish={() => handleSetHasLaunched(true)} />
          </AppProvider>
        ) : !permissionPromptDone ? (
          <AppProvider
            value={{
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
              isSerif,
              setIsSerif: handleSetIsSerif,
              feedbackSubmitted,
              setFeedbackSubmitted,
            }}
          >
            <PermissionPrompt
              onFinish={() => handleSetPermissionPromptDone(true)}
            />
          </AppProvider>
        ) : (
          <AppProvider
            value={{
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
              isSerif,
              setIsSerif: handleSetIsSerif,
              feedbackSubmitted,
              setFeedbackSubmitted,
            }}
          >
            <View
              className={`flex-1 ${isDark ? "dark bg-[#121212]" : "bg-[#FDFBF7]"}`}
            >
              <AppTabs />
            </View>
          </AppProvider>
        )}
      </ThemeProvider>
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
        {/* Soft, beautiful sun icon */}
        <View className="w-24 h-24 rounded-full bg-[#FEF3C7] dark:bg-[#252525] justify-center items-center shadow-sm">
          <Text className="text-5xl">🕊️</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity }} className="items-center">
        <Text className="text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#F3F4F6] mb-2 font-serif">
          FRESH WORDS
        </Text>
        <Text className="text-sm font-medium tracking-wide text-[#60646C] dark:text-[#B0B4BA] mb-12">
          Growing with God every day.
        </Text>
        <ActivityIndicator size="small" color="#1E40AF" />
      </Animated.View>
    </View>
  );
}
