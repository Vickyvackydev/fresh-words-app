import DevotionReader from "@/components/devotion-reader";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Devotional } from "../db/mockDb";

type FilterCategory =
  | "All"
  | "Daily Deliverance"
  | "Holiness"
  | "Prayer"
  | "Yearly Devotional";

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, bookmarks, toggleBookmark, offlineDevotionals } = useApp();

  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Reader state
  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

  const openDevotional = (dev: Devotional) => {
    setSelectedDevotional(dev);
    setReaderVisible(true);
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

  // Flatten all offline devotionals across categories and map to UI schema
  const allOfflineDevs: Devotional[] = Object.values(offlineDevotionals || {})
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
      actionPoints:
        typeof d.action_points === "string"
          ? JSON.parse(d.action_points || "[]")
          : [],
    }));

  // Filter & Sort Bookmarks
  let filtered = allOfflineDevs.filter((dev) => bookmarks.includes(dev.id));

  if (activeCategory !== "All") {
    filtered = filtered.filter((dev) => dev.category === activeCategory);
  }

  if (sortOrder === "newest") {
    filtered.sort((a, b) => b.date.localeCompare(a.date));
  } else {
    filtered.sort((a, b) => a.date.localeCompare(b.date));
  }

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
            Bookmarks
          </Text>
          <Pressable
            onPress={() =>
              setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
            }
            className="flex-row items-center py-1.5 px-3 rounded-lg bg-[#FAF8F5] gap-x-1 dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] active:opacity-60"
          >
            <Ionicons
              name="swap-vertical"
              size={14}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
            <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA] capitalize">
              {sortOrder}
            </Text>
          </Pressable>
        </View>

        {/* Categories filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row space-x-2 mb-6"
        >
          {(
            [
              "All",
              "Daily Deliverance",
              "Holiness",
              "Prayer",
              "Yearly Devotional",
            ] as FilterCategory[]
          ).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`py-2 px-4 rounded-full border mr-2 transition-all ${
                  isActive
                    ? "bg-[#1E40AF] border-[#1E40AF]"
                    : "bg-[#FAF8F5] border-[#E0E1E6] dark:bg-[#1C1C1E] dark:border-[#2E3135]"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive
                      ? "text-white"
                      : "text-[#60646C] dark:text-[#B0B4BA]"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bookmarked Cards */}
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-20 h-20 bg-[#F3EFE6] dark:bg-[#1E1E1E] rounded-full items-center justify-center mb-6">
              <Ionicons
                name="bookmark-outline"
                size={32}
                color={isDark ? "#B0B4BA" : "#60646C"}
              />
            </View>
            <Text className="text-lg font-bold text-center text-[#1C1917] dark:text-[#F3F4F6] mb-2 font-serif">
              No bookmarks yet
            </Text>
            <Text className="text-sm text-center leading-5 text-[#60646C] dark:text-[#B0B4BA] max-w-[240px]">
              Tap the bookmark icon on any daily devotional to save it for easy
              access later.
            </Text>
          </View>
        ) : (
          <View className="gap-y-4">
            {filtered.map((dev) => (
              <View
                key={dev.id}
                className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-5 mb-4 shadow-xs"
              >
                {/* Header details */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[10px] font-bold text-[#1E40AF] dark:text-[#60A5FA] tracking-wider">
                    {dev.category}
                  </Text>
                  <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                    {dev.date}
                  </Text>
                </View>

                {/* Body */}
                <Pressable
                  onPress={() => openDevotional(dev)}
                  className="active:opacity-75"
                >
                  <Text className="text-lg font-bold capitalize text-[#1C1917] dark:text-[#F3F4F6] font-serif mb-2 leading-tight">
                    {dev.title.toLowerCase()}
                  </Text>
                  <Text
                    className="text-sm leading-5 text-[#60646C] dark:text-[#B0B4BA] mb-4"
                    numberOfLines={2}
                  >
                    {dev.body[0]}
                  </Text>
                </Pressable>

                {/* Actions row */}
                <View className="flex-row justify-end items-center space-x-3 pt-3 border-t border-[#E0E1E6] dark:border-[#2E3135]">
                  <Pressable
                    onPress={() => handleShare(dev)}
                    className="w-9 h-9 bg-[#FAF8F5] dark:bg-[#2E3135] rounded-xl items-center justify-center active:scale-95 mr-2"
                  >
                    <Ionicons
                      name="share-outline"
                      size={16}
                      color={isDark ? "#B0B4BA" : "#60646C"}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => toggleBookmark(dev.id)}
                    className="w-9 h-9 bg-[#FEE2E2] dark:bg-[#3B1C1C] rounded-xl items-center justify-center active:scale-95"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={isDark ? "#FCA5A5" : "#EF4444"}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Reader Modal */}
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
