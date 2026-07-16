import DevotionReader from "@/components/devotion-reader";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Devotional } from "../db/mockDb";
import { useApp } from "@/context/AppContext";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { bookmarks, toggleBookmark, isDark, appSettings, offlineDevotionals, readingProgress } = useApp();

  // Reader state
  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

  const getActiveCategory = () => {
    if (!appSettings) return "Daily Deliverance";
    if (appSettings.daily_deliverance_enabled) return "Daily Deliverance";
    if (appSettings.yearly_devotional_enabled) return "Yearly Devotional";
    if (appSettings.holiness_enabled) return "Holiness";
    if (appSettings.prayer_enabled) return "Prayer";
    return "Daily Deliverance";
  };

  const activeCategory = getActiveCategory();
  const catDevotionals = offlineDevotionals[activeCategory] || [];

  // Determine current month / year dynamically
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();
  const todayDayNum = now.getDate();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = `${months[currentMonth]} ${currentYear}`;

  // Calculate days in current month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Calculate first day weekday offset
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDayOffset = firstDay.getDay(); // 0 is Sunday, 1 is Monday...

  const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const getDayStatus = (dayNum: number): "future" | "today" | "completed" | "missed" => {
    if (dayNum > todayDayNum) return "future";
    if (dayNum === todayDayNum) return "today";

    const dateObj = new Date(currentYear, currentMonth, dayNum);
    const dayOfYear = getDayOfYear(dateObj);
    const devIndex = (dayOfYear - 1) % (catDevotionals.length || 1);
    const cachedDevotional = catDevotionals[devIndex];

    if (cachedDevotional) {
      const isRead = readingProgress && readingProgress[cachedDevotional.id] !== undefined;
      if (isRead) return "completed";
    }

    return "missed";
  };

  const handleDatePress = (dayNum: number) => {
    if (catDevotionals.length === 0) return;
    const status = getDayStatus(dayNum);
    if (status === "future") return;

    // Resolve date and Day of Year index
    const dateObj = new Date(currentYear, currentMonth, dayNum);
    const dayOfYear = getDayOfYear(dateObj);
    const devIndex = (dayOfYear - 1) % catDevotionals.length;
    const cachedDevotional = catDevotionals[devIndex];

    if (cachedDevotional) {
      const formatted: Devotional = {
        id: cachedDevotional.id,
        category: cachedDevotional.category,
        title: cachedDevotional.title,
        date: `Day ${cachedDevotional.default_day || (devIndex + 1)}`,
        readingTime: Math.ceil(((cachedDevotional.body || "").length || 1000) / 800),
        scriptureRef: cachedDevotional.scripture_reference || "",
        scriptureText: cachedDevotional.scripture_quote || "",
        body: typeof cachedDevotional.body === "string"
          ? cachedDevotional.body.split("\n\n")
          : Array.isArray(cachedDevotional.body)
          ? cachedDevotional.body
          : [],
        prayer: cachedDevotional.prayer || "",
        reflection: cachedDevotional.reflection || "",
        actionPoints: typeof cachedDevotional.action_points === "string"
          ? JSON.parse(cachedDevotional.action_points || "[]")
          : Array.isArray(cachedDevotional.actionPoints)
          ? cachedDevotional.actionPoints
          : [],
      };
      setSelectedDevotional(formatted);
      setReaderVisible(true);
    }
  };

  // Generate calendar grid array
  const gridCells = [];
  // Fill initial offset empty cells
  for (let i = 0; i < startDayOffset; i++) {
    gridCells.push(null);
  }
  // Fill actual calendar days
  for (let d = 1; d <= totalDays; d++) {
    gridCells.push(d);
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
        <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] mb-6">
          Calendar
        </Text>

        {/* Calendar Grid Container */}
        <View className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-5 mb-8 shadow-xs">
          {/* Month Indicator */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {monthName}
            </Text>
            <View className="flex-row gap-x-2">
              <Pressable className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#2E3135] items-center justify-center border border-[#E0E1E6] dark:border-[#3E4249] opacity-40">
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={isDark ? "#F3F4F6" : "#1C1917"}
                />
              </Pressable>
              <Pressable className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#2E3135] items-center justify-center border border-[#E0E1E6] dark:border-[#3E4249] opacity-40">
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? "#F3F4F6" : "#1C1917"}
                />
              </Pressable>
            </View>
          </View>

          {/* Weekday headers */}
          <View className="flex-row mb-4">
            {weekdays.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA] uppercase">
                  {day[0]}
                </Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View className="flex-row flex-wrap">
            {gridCells.map((day, idx) => {
              if (day === null) {
                return (
                  <View key={`empty-${idx}`} className="w-[14.28%] h-14" />
                );
              }

              const status = getDayStatus(day);
              let borderStyle = "border-transparent";
              let textStyle = "text-[#1C1917] dark:text-[#F3F4F6]";
              let bgStyle = "bg-transparent";
              let showDot = false;
              let isDisabled = false;

              if (status === "today") {
                bgStyle = "bg-[#1E40AF]";
                textStyle = "text-white font-bold";
              } else if (status === "completed") {
                showDot = true;
                bgStyle = "bg-[#FAF8F5] dark:bg-[#252527]";
              } else if (status === "missed") {
                borderStyle =
                  "border-[#EF4444]/40 dark:border-[#F87171]/40 border-dashed border-2";
                textStyle = "text-[#EF4444] dark:text-[#FCA5A5]";
              } else if (status === "future") {
                textStyle = "text-[#E0E1E6] dark:text-[#2E3135]";
                isDisabled = true;
              }

              return (
                <Pressable
                  key={`day-${day}`}
                  disabled={isDisabled}
                  onPress={() => handleDatePress(day)}
                  className={`w-[14.28%] h-14 justify-center items-center rounded-2xl border mb-2 relative active:scale-95 ${borderStyle} ${bgStyle}`}
                >
                  <Text className={`text-sm font-semibold ${textStyle}`}>
                    {day}
                  </Text>

                  {showDot && (
                    <View className="absolute bottom-2 w-1 h-1 rounded-full bg-[#1E40AF] dark:bg-[#60A5FA]" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View className="flex-row justify-around bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] p-4 rounded-2xl">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#1E40AF] mr-2" />
            <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
              Today
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#FAF8F5] dark:bg-[#252527] border border-[#E0E1E6] dark:border-[#3E4249] justify-center items-center mr-2">
              <View className="w-1 h-1 rounded-full bg-[#1E40AF] dark:bg-[#60A5FA]" />
            </View>
            <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
              Completed
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 rounded-lg border-2 border-dashed border-[#EF4444]/40 justify-center items-center mr-2">
              <Text className="text-[8px] font-bold text-[#EF4444]">-</Text>
            </View>
            <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
              Missed
            </Text>
          </View>
        </View>
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
