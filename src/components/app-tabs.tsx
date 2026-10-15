import { useApp } from "@/context/AppContext";
import { getTranslation } from "../utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

interface AppTabsProps {
  isDark?: boolean;
  language?: string;
}

export default React.memo(function AppTabs({
  isDark: propIsDark,
  language: propLanguage,
}: AppTabsProps) {
  let isDark = propIsDark;
  let language = propLanguage;

  // Fallback to useApp only if not passed as props
  if (isDark === undefined || language === undefined) {
    try {
      const app = useApp();
      if (isDark === undefined) isDark = app.isDark;
      if (language === undefined) language = app.language;
    } catch {
      if (isDark === undefined) isDark = false;
      if (language === undefined) language = "en";
    }
  }

  const t = (key: string) => getTranslation(key, language || "en");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#60A5FA" : "#1E40AF",
        tabBarInactiveTintColor: isDark ? "#8E8E93" : "#8E8E93",
        tabBarStyle: {
          backgroundColor: isDark ? "#1C1C1E" : "#FAF8F5",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2E3135" : "#E0E1E6",
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: -0.2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="devotionals"
        options={{
          title: t("devotionals"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "journal" : "journal-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: t("bible"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: t("bookmarks"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("calendar"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hymns"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="hymn/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="devotional/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="+not-found"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
});
