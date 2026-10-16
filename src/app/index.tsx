import DevotionReader from "@/components/devotion-reader";
import { useApp } from "@/context/AppContext";
import { shareDevotional } from "@/utils/shareDevotional";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Share, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Devotional, MOCK_QUOTES } from "../db/mockDb";
import { getQuoteOfDay } from "../utils/quotes";
import { parseActionPoints } from "../utils/safeParse";
import { getBaseUrl } from "../api/client";

export function parseScriptureRef(scriptureRef?: string) {
  if (!scriptureRef) return null;
  let cleaned = scriptureRef.replace(/([A-Za-z]+)\s+\1/gi, "$1").trim();
  cleaned = cleaned.replace(/2 Chronicles onicles/gi, "2 Chronicles");
  cleaned = cleaned.replace(/1 Chronicles onicles/gi, "1 Chronicles");

  const match = cleaned.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+)(?::(\d+))?/);
  if (match) {
    const book = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;
    return { book, chapter, verse };
  }
  return null;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    isDark,
    bookmarks,
    toggleBookmark,
    readingProgress,
    saveProgress,
    offlineDevotionals,
    appSettings,
    tappedDevotional,
    setTappedDevotional,
    userName,
    activeDevotionalCategory,
    language,
    t,
  } = useApp();

  const getActiveCategory = () => {
    if (activeDevotionalCategory) {
      const metaId = activeDevotionalCategory.toLowerCase().replace(/ /g, "_");
      if (!appSettings || appSettings[`${metaId}_enabled`] !== false) {
        return activeDevotionalCategory;
      }
    }
    if (!appSettings) return "Daily Deliverance";
    if (appSettings.daily_deliverance_enabled) return "Daily Deliverance";
    if (appSettings.yearly_devotional_enabled) return "Yearly Devotional";
    if (appSettings.holiness_enabled) return "Holiness";
    if (appSettings.prayer_enabled) return "Prayer";
    return "Daily Deliverance";
  };

  const activeCategory = getActiveCategory();
  const catDevotionals = offlineDevotionals[activeCategory] || [];

  // Calculate current Day of Year
  const now = new Date();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = now.getHours();
    let greet = t("goodMorning");
    if (hour >= 12 && hour < 17) {
      greet = t("goodAfternoon");
    } else if (hour >= 17) {
      greet = t("goodEvening");
    }
    return userName.trim() ? `${greet}, ${userName.trim()}` : greet;
  };

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const startDay = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startDay.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const devIndex = (dayOfYear - 1) % (catDevotionals.length || 1);
  const cachedDevotional = catDevotionals[devIndex];

  // Translation support for today's devotion preview
  const [translatedTodayDevo, setTranslatedTodayDevo] = useState<any | null>(null);

  useEffect(() => {
    if (!language || language === "en" || !cachedDevotional?.id) {
      setTranslatedTodayDevo(null);
      return;
    }
    let isMounted = true;
    const baseUrl = getBaseUrl();
    fetch(`${baseUrl}/devotionals/${cachedDevotional.id}?lang=${language}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setTranslatedTodayDevo(json.data);
        }
      })
      .catch((err) => {
        console.warn("Home preview translation deferred:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [cachedDevotional?.id, language]);

  const activeDevo = translatedTodayDevo || cachedDevotional;

  // Map cached API format to Devotional interface expected by reader & components
  const todayDevotion: Devotional | null = activeDevo
    ? {
        id: activeDevo.id,
        category: activeDevo.category,
        title: activeDevo.title,
        date: `Day ${activeDevo.default_day || devIndex + 1}`,
        readingTime: Math.ceil(
          ((activeDevo.body || "").length || 1000) / 800,
        ),
        scriptureRef: activeDevo.scripture_reference || activeDevo.scriptureRef || "",
        scriptureText: activeDevo.scripture_quote || activeDevo.scriptureText || "",
        body:
          typeof activeDevo.body === "string"
            ? activeDevo.body.split("\n\n")
            : Array.isArray(activeDevo.body)
              ? activeDevo.body
              : [],
        prayer: activeDevo.prayer || "",
        reflection: activeDevo.reflection || "",
        actionPoints: parseActionPoints(
          activeDevo.action_points || activeDevo.actionPoints,
        ),
      }
    : null;

  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

  // Trigger preview when notification is tapped
  useEffect(() => {
    if (tappedDevotional) {
      // Map API format to reader format
      const formatted: Devotional = {
        id: tappedDevotional.id,
        category: tappedDevotional.category,
        title: tappedDevotional.title,
        date: `Day ${tappedDevotional.default_day}`,
        readingTime: Math.ceil(
          ((tappedDevotional.body || "").length || 1000) / 800,
        ),
        scriptureRef: tappedDevotional.scripture_reference || "",
        scriptureText: tappedDevotional.scripture_quote || "",
        body:
          typeof tappedDevotional.body === "string"
            ? tappedDevotional.body.split("\n\n")
            : Array.isArray(tappedDevotional.body)
              ? tappedDevotional.body
              : [],
        prayer: tappedDevotional.prayer || "",
        reflection: tappedDevotional.reflection || "",
        actionPoints: parseActionPoints(
          tappedDevotional.action_points || tappedDevotional.actionPoints,
        ),
      };
      setSelectedDevotional(formatted);
      setReaderVisible(true);
      setTappedDevotional(null);
    }
  }, [tappedDevotional]);

  // Auto scroll to today's devotion on open (simulated)
  useEffect(() => {
    // Scroll layout logic if needed
  }, []);

  const openDevotional = (dev: Devotional) => {
    setSelectedDevotional(dev);
    setReaderVisible(true);
    // Mark reading progress started if not already
    if (!readingProgress[dev.id]) {
      saveProgress(dev.id, 0.1);
    }
  };

  const handleShare = async (dev: Devotional) => {
    await shareDevotional(dev);
  };

  // Flatten all offline devotionals across categories and map to UI schema
  const allOfflineDevs: Devotional[] = Object.values(offlineDevotionals)
    .flat()
    .map((d: any) => ({
      id: d.id,
      category: d.category,
      title: d.title,
      date: `Day ${d.default_day}`,
      readingTime: Math.ceil(((d.body || "").length || 1000) / 800),
      scriptureRef: d.scripture_reference || "",
      scriptureText: d.scripture_quote || "",
      body:
        typeof d.body === "string"
          ? d.body.split("\n\n")
          : Array.isArray(d.body)
            ? d.body
            : [],
      prayer: d.prayer || "",
      reflection: d.reflection || "",
      actionPoints: parseActionPoints(d.action_points || d.actionPoints),
    }));

  const bookmarkedList = allOfflineDevs.filter((d) => bookmarks.includes(d.id));

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      {/* Home Feed Scroll */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar & Profile Greeting */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {getGreeting()}
            </Text>
            <Text className="text-sm font-medium text-[#60646C] dark:text-[#B0B4BA]">
              {formattedDate}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            className="w-11 h-11 rounded-full bg-[#F3EFE6] dark:bg-[#1E1E1E] items-center justify-center active:scale-95"
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={isDark ? "#F3F4F6" : "#1C1917"}
            />
          </Pressable>
        </View>

        {/* Sync Pending Card or Today's Devotion Block */}
        {todayDevotion === null ? (
          <View className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-6 mb-6 items-center text-center shadow-xs">
            <View className="w-14 h-14 rounded-full bg-[#EEF2FF] dark:bg-[#1A1F36] items-center justify-center mb-4">
              <Ionicons
                name="cloud-download-outline"
                size={24}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
            </View>
            <Text className="text-lg font-bold text-[#1C1917] dark:text-[#F3F4F6] mb-2 text-center font-serif">
              {t("syncTodayDevotional")}
            </Text>
            <Text className="text-sm text-[#60646C] dark:text-[#B0B4BA] mb-6 text-center leading-5 max-w-xs">
              {t("noOfflineDevotionalsCached")}
            </Text>
            <Pressable
              onPress={() => router.push("/settings")}
              className="w-full bg-[#1E40AF] dark:bg-[#2563EB] h-11 rounded-xl items-center justify-center active:opacity-90"
            >
              <Text className="text-white text-sm font-semibold">
                {t("goToSettingsSync")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Hero Section: Today's Verse Card (Commented out per user request) */}
            {/*
            <View className="bg-[#FAF8F5] dark:bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#E0E1E6] dark:border-[#2E3135] shadow-xs">
              <View className="flex-row gap-x-2 items-center mb-3">
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color={isDark ? "#60A5FA" : "#1E40AF"}
                />
                <Text className="text-xs font-bold tracking-wider text-[#1E40AF] dark:text-[#60A5FA]">
                  Today's Verse
                </Text>
              </View>
              <Text className="text-base italic leading-6 text-[#2C2A29] dark:text-[#E5E7EB] mb-4 font-serif">
                "
                {todayDevotion.scriptureText || "No scripture verse for today."}
                "
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
                  {todayDevotion.scriptureRef || "Daily Reading"}
                </Text>
              </View>
            </View>
            */}

            {/* Primary Action Hero: Today's Devotion Card */}
            <View className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 mb-6 border border-[#E0E1E6] dark:border-[#2E3135] shadow-xs">
              <View className="flex-row justify-between items-center mb-4">
                <View className="bg-[#EEF2FF] dark:bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-[#DBEAFE] dark:border-[#334155]">
                  <Text className="text-sm font-bold tracking-wide text-[#1E40AF] dark:text-[#60A5FA]">
                    {t("todayDevotion")}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-[#60646C] dark:text-[#B0B4BA]">
                  {todayDevotion.readingTime} {t("minRead")}
                </Text>
              </View>

              <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] mb-3 leading-tight">
                {todayDevotion.title}
              </Text>
              <Text
                className="text-sm leading-6 text-[#60646C] dark:text-[#B0B4BA] mb-6"
                numberOfLines={6}
              >
                {Array.isArray(todayDevotion.body)
                  ? todayDevotion.body.join("\n\n")
                  : todayDevotion.body}
              </Text>

              <View className="flex-row justify-between items-center">
                <Pressable
                  onPress={() => openDevotional(todayDevotion)}
                  className="flex-1 bg-[#1E40AF] dark:bg-[#2563EB] min-h-[44px] py-2.5 px-3 rounded-xl items-center justify-center active:opacity-90 mr-2"
                >
                  <Text
                    className="text-white text-sm font-semibold text-center"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {t("readFullDevotional")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => toggleBookmark(todayDevotion.id)}
                  className="w-11 h-11 bg-[#F3EFE6] dark:bg-[#2E3135] rounded-xl items-center justify-center active:scale-95 mr-2"
                >
                  <Ionicons
                    name={
                      bookmarks.includes(todayDevotion.id)
                        ? "bookmark"
                        : "bookmark-outline"
                    }
                    size={18}
                    color={
                      bookmarks.includes(todayDevotion.id)
                        ? "#1E40AF"
                        : isDark
                          ? "#F3F4F6"
                          : "#1C1917"
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={() => handleShare(todayDevotion)}
                  className="w-11 h-11 bg-[#F3EFE6] dark:bg-[#2E3135] rounded-xl items-center justify-center active:scale-95"
                >
                  <Ionicons
                    name="share-outline"
                    size={18}
                    color={isDark ? "#F3F4F6" : "#1C1917"}
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}

        {/* Quick Action Navigation Grid */}
        <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-4">
          {t("quickActions")}
        </Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {[
            { label: t("bible"), icon: "book", route: "/bible" },
            { label: t("devotionals"), icon: "journal", route: "/devotionals" },
            { label: t("hymnal"), icon: "musical-notes", route: "/hymns" },
            { label: t("bookmarks"), icon: "bookmark", route: "/bookmarks" },
          ].map((act, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(act.route as any)}
              className="w-[48%] bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] p-4 rounded-2xl flex-row items-center mb-3 active:bg-[#F3EFE6] dark:active:bg-[#252525]"
            >
              <View className="w-10 h-10 rounded-full bg-[#EEF2FF] dark:bg-[#1A1F36] items-center justify-center mr-3 shrink-0">
                <Ionicons
                  name={act.icon as any}
                  size={18}
                  color={isDark ? "#60A5FA" : "#1E40AF"}
                />
              </View>
              <Text
                className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6] flex-1"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {act.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Today's Prayer Card */}
        {todayDevotion && todayDevotion.prayer ? (
          <Pressable
            onPress={() => openDevotional(todayDevotion)}
            className="bg-[#EEF2FF] dark:bg-[#1A1F36] rounded-3xl p-6 mb-6 active:opacity-95"
          >
            <View className="flex-row items-center mb-3 gap-x-2">
              <Ionicons
                name="heart"
                size={18}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
              <Text className="text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-[#60A5FA]">
                {t("todayPrayer")}
              </Text>
            </View>
            <Text
              className="text-sm leading-6 italic text-[#1F2937] dark:text-[#E5E7EB] mb-4 font-serif"
              numberOfLines={3}
            >
              "{todayDevotion.prayer}"
            </Text>
            <Text className="text-xs font-semibold text-[#1E40AF] dark:text-[#60A5FA]">
              {t("readPrayerDevotional")} →
            </Text>
          </Pressable>
        ) : null}

        {/* Recently Bookmarked Horizontal scrolling list */}
        {bookmarkedList.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-4">
              {t("recentlyBookmarked")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="space-x-4"
            >
              {bookmarkedList.map((dev) => (
                <Pressable
                  key={dev.id}
                  onPress={() => openDevotional(dev)}
                  className="w-64 bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] p-5 rounded-2xl mr-4 active:bg-[#F3EFE6]"
                >
                  <Text className="text-[10px] font-bold text-[#1E40AF] dark:text-[#60A5FA] uppercase tracking-wider mb-2">
                    {dev.category}
                  </Text>
                  <Text
                    className="text-base font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif mb-1"
                    numberOfLines={1}
                  >
                    {dev.title}
                  </Text>
                  <Text
                    className="text-xs text-[#60646C] dark:text-[#B0B4BA]"
                    numberOfLines={2}
                  >
                    {dev.body[0]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Daily Quote Card — Rendered Dynamically from quotes.ts */}
        <View className="bg-[#FFFDF9] dark:bg-[#1E1E1E] border border-[#FEF3C7] dark:border-[#2B2315] rounded-3xl p-6 mb-4">
          <Text className="text-xs font-bold tracking-wider text-[#D97706] mb-3">
            {t("dailyQuote")}
          </Text>
          <Text className="text-base italic leading-6 text-[#2C2A29] dark:text-[#E5E7EB] mb-2 font-serif">
            "{getQuoteOfDay(undefined, language).text}"
          </Text>
          <Text className="text-xs text-right font-semibold text-[#60646C] dark:text-[#B0B4BA]">
            — {getQuoteOfDay(undefined, language).author}
          </Text>
        </View>
      </ScrollView>

      {/* Slide-Up Devotion Reader Modal */}
      <DevotionReader
        devotional={selectedDevotional}
        dateLabel={t("today")}
        visible={readerVisible}
        onClose={() => setReaderVisible(false)}
        onToggleBookmark={toggleBookmark}
        isBookmarked={
          selectedDevotional ? bookmarks.includes(selectedDevotional.id) : false
        }
      />
    </SafeAreaView>
  );
}
