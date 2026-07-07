import DevotionReader from "@/components/devotion-reader";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Devotional, MOCK_DEVOTIONALS } from "../db/mockDb";
import { useApp } from "./_layout";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { bookmarks, toggleBookmark, isDark } = useApp();

  // Reader state
  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);

  // Month configurations
  const monthName = "July 2026";
  const totalDays = 31;
  const startDayOffset = 3; // July 1, 2026 is a Wednesday (Sunday=0, Monday=1, Tuesday=2, Wednesday=3)

  // Status mapping for July 2026
  // Completed: July 1, 2, 4
  // Missed: July 3
  // Today: July 5
  // Future: July 6 and after
  const todayDayNum = 5;

  const getDayStatus = (dayNum: number) => {
    if (dayNum > todayDayNum) return "future";
    if (dayNum === todayDayNum) return "today";
    if (dayNum === 3) return "missed"; // July 3 is missed
    return "completed"; // July 1, 2, 4 are completed
  };

  const handleDatePress = (dayNum: number) => {
    const status = getDayStatus(dayNum);
    if (status === "future") return; // disabled

    // Find devotional for this date
    const dateStr = `2026-07-${dayNum.toString().padStart(2, "0")}`;
    const dev = MOCK_DEVOTIONALS.find((d) => d.date === dateStr);

    if (dev) {
      setSelectedDevotional(dev);
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
