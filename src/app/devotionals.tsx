import DevotionReader from "@/components/devotion-reader";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Devotional } from "../db/mockDb";

const CATEGORY_METADATA: Record<
  string,
  { id: string; desc: string; icon: string; bg: string; text: string }
> = {
  "Daily Deliverance": {
    id: "daily_deliverance",
    desc: "Daily warfare, freedom, and deliverance teachings",
    icon: "shield-checkmark-outline",
    bg: "#EEF2FF",
    text: "#1E40AF",
  },
  Holiness: {
    id: "holiness",
    desc: "Daily walk in purity, righteousness, and consecration",
    icon: "sparkles-outline",
    bg: "#FEF3C7",
    text: "#D97706",
  },
  Prayer: {
    id: "prayer",
    desc: "Daily intercession, altar fire, and spiritual strength",
    icon: "heart-outline",
    bg: "#FCE7F3",
    text: "#DB2777",
  },
  "Yearly Devotional": {
    id: "yearly_devotional",
    desc: "Complete 365-day annual spiritual growth guide",
    icon: "journal-outline",
    bg: "#E0E7FF",
    text: "#4338CA",
  },
};

export default function DevotionalsScreen() {
  const insets = useSafeAreaInsets();
  const {
    isDark,
    appSettings,
    offlineDevotionals,
    activeDevotionalCategory,
    setActiveDevotionalCategory,
    readingProgress,
    bookmarks,
    toggleBookmark,
  } = useApp();

  // Navigation flow state: 'categories' | 'days'
  const [viewMode, setViewMode] = useState<"categories" | "days">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search & Filter in Days View
  const [daySearchQuery, setDaySearchQuery] = useState("");

  // Reader Modal State
  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

  // Categories enabled by Admin (or default all if appSettings not loaded yet)
  const availableCategories = Object.keys(CATEGORY_METADATA).filter(
    (catKey) => {
      const meta = CATEGORY_METADATA[catKey];
      if (!appSettings) return true;
      return appSettings[`${meta.id}_enabled`] !== false;
    },
  );

  // Resolve devotionals for selected category
  const activeCatKey = selectedCategory || activeDevotionalCategory;
  const currentCategoryDevs = (offlineDevotionals[activeCatKey] || []).map(
    (d: any, idx: number) => ({
      id: d.id,
      category: d.category || activeCatKey,
      title: d.title,
      date: `Day ${d.default_day || idx + 1}`,
      default_day: d.default_day || idx + 1,
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
          ? d.action_points.trim().startsWith("[")
            ? JSON.parse(d.action_points || "[]")
            : [d.action_points]
          : Array.isArray(d.actionPoints)
            ? d.actionPoints
            : [],
    }),
  );

  // Filtered days list
  const filteredDays = currentCategoryDevs.filter((d: any) => {
    if (!daySearchQuery.trim()) return true;
    const q = daySearchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.date.toLowerCase().includes(q) ||
      d.scriptureRef.toLowerCase().includes(q)
    );
  });

  const openDevotionReader = (dev: Devotional) => {
    setSelectedDevotional(dev);
    setReaderVisible(true);
  };

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      {/* View Mode 1: Categories Library */}
      {viewMode === "categories" && (
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
          <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] mb-2">
            Devotionals
          </Text>
          <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] mb-6">
            Browse all available devotional series & set your primary reader
          </Text>

          {/* Active Default Banner */}
          <View className="bg-[#EEF2FF] dark:bg-[#1A1F36] border border-[#C7D2FE] dark:border-[#2E3A59] p-4 rounded-2xl flex-row items-center justify-between mb-8 shadow-xs">
            <View className="flex-row items-center gap-x-3 flex-1 mr-2">
              <View className="w-10 h-10 rounded-full bg-[#1E40AF] dark:bg-[#2563EB] items-center justify-center">
                <Ionicons name="star" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold tracking-wider text-[#1E40AF] dark:text-[#60A5FA]">
                  Active Default Devotional
                </Text>
                <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                  {activeDevotionalCategory}
                </Text>
              </View>
            </View>
            <View className="px-2.5 py-1 rounded-full bg-[#1E40AF]/10 dark:bg-[#60A5FA]/20">
              <Text className="text-[10px] font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                Reminders On
              </Text>
            </View>
          </View>

          {/* Categories Grid / Cards List */}
          <Text className="text-xs font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-4">
            Available Categories
          </Text>

          <View className="gap-y-4">
            {availableCategories.map((catName) => {
              const meta = CATEGORY_METADATA[catName] || {
                desc: "Spiritual daily growth guide",
                icon: "book-outline",
                bg: "#EEF2FF",
                text: "#1E40AF",
              };
              const isDefault = activeDevotionalCategory === catName;
              const devsCount = (offlineDevotionals[catName] || []).length;

              return (
                <View
                  key={catName}
                  className={`bg-white dark:bg-[#1C1C1E] border rounded-3xl p-5 shadow-xs transition-all ${
                    isDefault
                      ? "border-[#1E40AF] dark:border-[#3B82F6]"
                      : "border-[#E0E1E6] dark:border-[#2E3135]"
                  }`}
                >
                  <Pressable
                    onPress={() => {
                      setSelectedCategory(catName);
                      setViewMode("days");
                    }}
                    className="active:opacity-80"
                  >
                    {/* Top Row */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center gap-x-3">
                        <View
                          className="w-11 h-11 rounded-2xl items-center justify-center"
                          style={{
                            backgroundColor: isDark ? "#252527" : meta.bg,
                          }}
                        >
                          <Ionicons
                            name={meta.icon as any}
                            size={22}
                            color={isDark ? "#60A5FA" : meta.text}
                          />
                        </View>
                        <View>
                          <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
                            {catName}
                          </Text>
                          <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                            {devsCount > 0
                              ? `${devsCount} Days Available`
                              : "Cached Offline"}
                          </Text>
                        </View>
                      </View>

                      {isDefault && (
                        <View className="flex-row items-center gap-x-1 px-2.5 py-1 rounded-full bg-[#1E40AF] dark:bg-[#2563EB]">
                          <Ionicons
                            name="checkmark-circle"
                            size={12}
                            color="#FFF"
                          />
                          <Text className="text-[10px] font-bold text-white">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Description */}
                    <Text className="text-xs leading-5 text-[#60646C] dark:text-[#B0B4BA] mb-4">
                      {meta.desc}
                    </Text>
                  </Pressable>

                  {/* Actions Row */}
                  <View className="flex-row justify-between items-center pt-3 border-t border-[#E0E1E6] dark:border-[#2E3135]">
                    {!isDefault ? (
                      <Pressable
                        onPress={() => setActiveDevotionalCategory(catName)}
                        className="py-1.5 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#252527] border border-[#E0E1E6] dark:border-[#3E4249] flex-row items-center gap-x-1.5 active:opacity-75"
                      >
                        <Ionicons
                          name="star-outline"
                          size={14}
                          color={isDark ? "#60A5FA" : "#1E40AF"}
                        />
                        <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                          Set as Default
                        </Text>
                      </Pressable>
                    ) : (
                      <Text className="text-[11px] font-semibold text-[#10B981]">
                        ✓ Selected for Daily Reminders
                      </Text>
                    )}

                    <Pressable
                      onPress={() => {
                        setSelectedCategory(catName);
                        setViewMode("days");
                      }}
                      className="flex-row items-center gap-x-1 py-1.5 px-3 rounded-xl bg-[#1E40AF] dark:bg-[#2563EB] active:opacity-90"
                    >
                      <Text className="text-xs font-bold text-white">
                        Explore Days
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* View Mode 2: Days List / Grid (Hierarchical like Bible section) */}
      {viewMode === "days" && (
        <View className="flex-1 px-6 pt-3">
          {/* Sub Header Bar */}
          <View className="flex-row items-center justify-between pb-4 border-b border-[#E0E1E6] dark:border-[#2E3135] mb-4">
            <Pressable
              onPress={() => setViewMode("categories")}
              className="flex-row items-center py-1 active:opacity-60"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
              <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] ml-1">
                Library
              </Text>
            </Pressable>
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {activeCatKey}
            </Text>
            <Pressable
              onPress={() => setActiveDevotionalCategory(activeCatKey)}
              hitSlop={10}
              className="active:opacity-75"
            >
              <Ionicons
                name={
                  activeDevotionalCategory === activeCatKey
                    ? "star"
                    : "star-outline"
                }
                size={20}
                color={
                  activeDevotionalCategory === activeCatKey
                    ? "#D97706"
                    : isDark
                      ? "#B0B4BA"
                      : "#60646C"
                }
              />
            </Pressable>
          </View>

          {/* Day Search Bar */}
          <View className="flex-row items-center gap-x-2 bg-[#FAF8F5] dark:bg-[#1E1E1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl px-3 h-12 mb-4">
            <Ionicons
              name="search-outline"
              size={18}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
            <TextInput
              value={daySearchQuery}
              onChangeText={setDaySearchQuery}
              placeholder="Search day or title..."
              placeholderTextColor={isDark ? "#B0B4BA" : "#60646C"}
              className="flex-1 h-full py-0 mb-2 text-sm text-[#1C1917] dark:text-[#F3F4F6] font-sans"
              autoCorrect={false}
            />
            {daySearchQuery.length > 0 && (
              <Pressable onPress={() => setDaySearchQuery("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            )}
          </View>

          {/* Days Grid List */}
          <FlatList
            data={filteredDays}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="py-16 items-center">
                <Ionicons
                  name="document-text-outline"
                  size={36}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6] mt-3">
                  No days found
                </Text>
                <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] mt-1 text-center">
                  Try searching a different title or sync devotionals in
                  settings.
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isRead =
                readingProgress && readingProgress[item.id] !== undefined;

              return (
                <Pressable
                  onPress={() => openDevotionReader(item as any)}
                  className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] px-4 py-3.5 rounded-2xl mb-2.5 flex-row justify-between items-center active:bg-[#F3EFE6] dark:active:bg-[#252525] shadow-xs"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1A1F36] items-center justify-center mr-3">
                      <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                        {item.default_day}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-sm font-bold capitalize text-[#1C1917] dark:text-[#F3F4F6] font-serif"
                        numberOfLines={1}
                      >
                        {item.title.toLowerCase()}
                      </Text>
                      <Text
                        className="text-[11px] text-[#60646C] dark:text-[#B0B4BA]"
                        numberOfLines={1}
                      >
                        {item.scriptureRef || item.date}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-x-2">
                    {isRead && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#10B981"
                      />
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#B0B4BA"
                    />
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Devotion Reader Modal */}
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
