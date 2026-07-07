import DevotionReader from "@/components/devotion-reader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Devotional, MOCK_DEVOTIONALS, MOCK_QUOTES } from "../db/mockDb";
import { useApp } from "./_layout";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { isDark, bookmarks, toggleBookmark, readingProgress, saveProgress } =
    useApp();

  // Find today's devotion (Hebrews 11:1-3 date is 2026-07-05)
  const todayDevotion =
    MOCK_DEVOTIONALS.find((d) => d.date === "2026-07-05") ||
    MOCK_DEVOTIONALS[0];
  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

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
    try {
      await Share.share({
        message: `Fresh Words Devotional: "${dev.title}" (${dev.scriptureRef})\n\nRead more in the Fresh Words app!`,
        title: dev.title,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const bookmarkedList = MOCK_DEVOTIONALS.filter((d) =>
    bookmarks.includes(d.id),
  );

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
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar & Profile Greeting */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              Good Morning, Victor
            </Text>
            <Text className="text-sm font-medium text-[#60646C] dark:text-[#B0B4BA]">
              Sunday, July 5
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            className="w-11 h-11 rounded-full bg-[#F3EFE6] dark:bg-[#1E1E1E] items-center justify-center active:scale-95"
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={isDark ? "#F3F4F6" : "#1C1917"}
              // className="text-[#1C1917] dark:text-[#F3F4F6]"
            />
          </Pressable>
        </View>

        {/* Hero Section: Today's Verse Card */}
        <View className="bg-[#FAF8F5] dark:bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#E0E1E6] dark:border-[#2E3135] shadow-xs">
          <View className="flex-row gap-x-2 items-center mb-3">
            <Ionicons
              name="leaf-outline"
              size={18}
              color={isDark ? "#60A5FA" : "#1E40AF"}
            />
            <Text className="text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-[#60A5FA]">
              Today's Verse
            </Text>
          </View>
          <Text className="text-base italic leading-6 text-[#2C2A29] dark:text-[#E5E7EB] mb-4 font-serif">
            "Now faith is the assurance of things hoped for, the conviction of
            things not seen."
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
              Hebrews 11:1
            </Text>
            <Pressable
              onPress={() => router.push("/bible")}
              className="py-1.5 px-3 rounded-lg bg-[#E0E1E6] dark:bg-[#2E3135] active:opacity-70"
            >
              <Text className="text-xs font-semibold text-[#1E40AF] dark:text-[#60A5FA]">
                Read Chapter
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Primary Action Hero: Today's Devotion Card */}
        <View className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 mb-6 border border-[#E0E1E6] dark:border-[#2E3135] shadow-xs">
          <View className="flex-row justify-between items-center mb-3">
            <View className="bg-[#EEF2FF] dark:bg-[#1A1F36] px-2.5 py-1 rounded-md">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-[#1E40AF] dark:text-[#60A5FA]">
                {todayDevotion.category}
              </Text>
            </View>
            <Text className="text-xs font-medium text-[#60646C] dark:text-[#B0B4BA]">
              {todayDevotion.readingTime} min read
            </Text>
          </View>

          <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] mb-2 leading-tight">
            {todayDevotion.title}
          </Text>
          <Text
            className="text-sm leading-5 text-[#60646C] dark:text-[#B0B4BA] mb-5"
            numberOfLines={2}
          >
            {todayDevotion.body[0]}
          </Text>

          {/* Progress bar */}
          <View className="h-1.5 w-full bg-[#E0E1E6] dark:bg-[#2E3135] rounded-full mb-6 overflow-hidden">
            <View
              className="h-full bg-[#1E40AF] dark:bg-[#60A5FA]"
              style={{
                width: `${(readingProgress[todayDevotion.id] || 0) * 100}%`,
              }}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Pressable
              onPress={() => openDevotional(todayDevotion)}
              className="flex-1 bg-[#1E40AF] dark:bg-[#2563EB] h-11 rounded-xl items-center justify-center active:opacity-90 mr-4"
            >
              <Text className="text-white text-sm font-semibold">
                {readingProgress[todayDevotion.id] &&
                readingProgress[todayDevotion.id] > 0.1
                  ? "Continue Reading"
                  : "Read Today's Devotion"}
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
                // className={
                //   bookmarks.includes(todayDevotion.id)
                //     ? ""
                //     : "text-[#1C1917] dark:text-[#F3F4F6]"
                // }
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
                // className="text-[#1C1917] dark:text-[#F3F4F6]"
              />
            </Pressable>
          </View>
        </View>

        {/* Quick Action Navigation Grid */}
        <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-4">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {[
            { label: "Bible", icon: "book", route: "/bible" },
            { label: "Bookmarks", icon: "bookmark", route: "/bookmarks" },
            { label: "Calendar", icon: "calendar", route: "/calendar" },
            { label: "Settings", icon: "settings", route: "/settings" },
          ].map((act, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(act.route as any)}
              className="w-[48%] bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] p-4 rounded-2xl flex-row items-center mb-3 active:bg-[#F3EFE6] dark:active:bg-[#252525]"
            >
              <View className="w-10 h-10 rounded-full bg-[#EEF2FF] dark:bg-[#1A1F36] items-center justify-center mr-3">
                <Ionicons
                  name={act.icon as any}
                  size={18}
                  color={isDark ? "#60A5FA" : "#1E40AF"}
                />
              </View>
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                {act.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Today's Prayer Card */}
        <Pressable
          onPress={() => openDevotional(todayDevotion)}
          className="bg-[#EEF2FF] dark:bg-[#1A1F36] rounded-3xl p-6 mb-6 active:opacity-95"
        >
          <View className="flex-row items-center mb-3 gap-x-2">
            <Ionicons
              name="heart"
              size={18}
              color={isDark ? "#60A5FA" : "#1E40AF"}
              // className="text-[#1E40AF] dark:text-[#60A5FA] mr-2"
            />
            <Text className="text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-[#60A5FA]">
              Today's Prayer
            </Text>
          </View>
          <Text
            className="text-sm leading-6 italic text-[#1F2937] dark:text-[#E5E7EB] mb-4 font-serif"
            numberOfLines={3}
          >
            "{todayDevotion.prayer}"
          </Text>
          <Text className="text-xs font-semibold text-[#1E40AF] dark:text-[#60A5FA]">
            Read Prayer Devotional →
          </Text>
        </Pressable>

        {/* Recently Bookmarked Horizontal scrolling list */}
        {bookmarkedList.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-4">
              Recently Bookmarked
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

        {/* Daily Quote Card */}
        <View className="bg-[#FFFDF9] dark:bg-[#1E1E1E] border border-[#FEF3C7] dark:border-[#2B2315] rounded-3xl p-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-[#D97706] mb-3">
            Daily Quote
          </Text>
          <Text className="text-base italic leading-6 text-[#2C2A29] dark:text-[#E5E7EB] mb-2 font-serif">
            "{MOCK_QUOTES[0].text}"
          </Text>
          <Text className="text-xs text-right font-semibold text-[#60646C] dark:text-[#B0B4BA]">
            — {MOCK_QUOTES[0].author}
          </Text>
        </View>
      </ScrollView>

      {/* Slide-Up Devotion Reader Modal */}
      <DevotionReader
        devotional={selectedDevotional}
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
