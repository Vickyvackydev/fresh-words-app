import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBaseUrl } from "../api/client";
import { Devotional } from "../db/mockDb";

interface DevotionReaderProps {
  devotional: Devotional | null;
  visible: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function DevotionReader({
  devotional: rawDevotional,
  visible,
  onClose,
  onToggleBookmark,
  isBookmarked,
  onNext,
  onPrev,
}: DevotionReaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark, fontSize, setFontSize } = useApp();
  const [showControls, setShowControls] = useState<boolean>(false);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>(
    {},
  );
  // Animations
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height),
  ).current;

  // Load checklist items
  useEffect(() => {
    if (rawDevotional) {
      setCheckedActions({});
    }
  }, [rawDevotional]);

  // Track devotional read events
  useEffect(() => {
    if (visible && rawDevotional) {
      const baseUrl = getBaseUrl();
      fetch(`${baseUrl}/devotionals/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          devotional_id: rawDevotional.id,
        }),
      }).catch((e) => {
        console.warn("Deferred view tracking: client offline.", e);
      });
    }
  }, [visible, rawDevotional?.id]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!rawDevotional) return null;

  const devotional = {
    ...rawDevotional,
    scriptureRef:
      rawDevotional.scriptureRef ||
      (rawDevotional as any).scripture_reference ||
      "",
    scriptureText:
      rawDevotional.scriptureText ||
      (rawDevotional as any).scripture_quote ||
      "",
    body: Array.isArray(rawDevotional.body)
      ? rawDevotional.body
      : typeof rawDevotional.body === "string"
        ? (rawDevotional.body as string).split("\n\n")
        : [],
    actionPoints: Array.isArray(rawDevotional.actionPoints)
      ? rawDevotional.actionPoints
      : typeof (rawDevotional as any).action_points === "string"
        ? JSON.parse((rawDevotional as any).action_points || "[]")
        : [],
    date:
      rawDevotional.date || `Day ${(rawDevotional as any).default_day || 1}`,
    readingTime:
      rawDevotional.readingTime ||
      Math.ceil(((rawDevotional.body || "").length || 1000) / 800) ||
      2,
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Fresh Words Devotional: "${devotional.title}" (${devotional.scriptureRef})\n\n${devotional.body[0]}`,
        title: devotional.title,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const triggerBookmarkAnim = () => {
    onToggleBookmark(devotional.id);
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bookmarkScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleActionPoint = (idx: number) => {
    const key = `${devotional.id}-${idx}`;
    setCheckedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
        style={{
          transform: [{ translateY: slideAnim }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Top Header Navigation */}
        <View className="flex-row items-center justify-between px-6 py-3 border-b border-[#E0E1E6] dark:border-[#2E3135]">
          <Pressable
            onPress={onClose}
            hitSlop={15}
            className="flex-row items-center active:opacity-60"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? "#F3F4F6" : "#1C1917"}
            />
            <Text className="text-sm font-medium text-[#1C1917] dark:text-[#F3F4F6] ml-1">
              Today
            </Text>
          </Pressable>

          <Text
            className="text-xs font-semibold tracking-wider text-[#60646C] dark:text-[#B0B4BA] max-w-[150px]"
            numberOfLines={1}
          >
            {devotional.category}
          </Text>

          <View className="flex-row items-center space-x-4">
            <Pressable
              onPress={() => setShowControls(!showControls)}
              hitSlop={10}
              className="active:opacity-60 mr-4"
            >
              <Ionicons
                name="text-outline"
                size={22}
                className="text-[#1C1917] dark:text-[#F3F4F6]"
              />
            </Pressable>

            <Animated.View
              style={{ transform: [{ scale: bookmarkScale }] }}
              className="mr-4"
            >
              <Pressable
                onPress={triggerBookmarkAnim}
                hitSlop={10}
                className="active:opacity-60"
              >
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={isBookmarked ? "#1E40AF" : undefined}
                  className={
                    isBookmarked ? "" : "text-[#1C1917] dark:text-[#F3F4F6]"
                  }
                />
              </Pressable>
            </Animated.View>

            <Pressable
              onPress={handleShare}
              hitSlop={10}
              className="active:opacity-60"
            >
              <Ionicons
                name="share-outline"
                size={22}
                className="text-[#1C1917] dark:text-[#F3F4F6]"
              />
            </Pressable>
          </View>
        </View>

        {/* Kindle font & layout controls drawer */}
        {showControls && (
          <View className="bg-[#F3EFE6] dark:bg-[#1E1E1E] px-6 py-4 border-b border-[#E0E1E6] dark:border-[#2E3135] space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium text-[#60646C] dark:text-[#B0B4BA]">
                Text Size
              </Text>
              <View className="flex-row items-center space-x-6">
                <Pressable
                  onPress={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="w-10 h-10 bg-[#E0E1E6] dark:bg-[#2E3135] rounded-full items-center justify-center active:opacity-60"
                >
                  <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6]">
                    -
                  </Text>
                </Pressable>
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  {fontSize}px
                </Text>
                <Pressable
                  onPress={() => setFontSize(Math.min(30, fontSize + 2))}
                  className="w-10 h-10 bg-[#E0E1E6] dark:bg-[#2E3135] rounded-full items-center justify-center active:opacity-60"
                >
                  <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6]">
                    +
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Devotional Content Scroll */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingVertical: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline details */}
          <Text className="text-xs font-medium text-[#60646C] dark:text-[#B0B4BA] mb-2 font-sans">
            {devotional.date} • {devotional.readingTime} min read
          </Text>

          <Text
            className="text-3xl font-extrabold text-[#1C1917] dark:text-[#F3F4F6] mb-6 leading-tight font-sans"
            style={{ fontSize: fontSize + 10 }}
          >
            {devotional.title}
          </Text>

          {/* Scripture Quote Box */}
          <View className="bg-[#F5F2EA] dark:bg-[#1A1A1A] p-5 rounded-2xl mb-8 border-l-4 border-[#1E40AF]">
            <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA] mb-2 uppercase tracking-wide">
              {devotional.scriptureRef}
            </Text>
            <Text
              className={`italic text-[#2C2A29] dark:text-[#E5E7EB] leading-relaxed`}
              style={{
                fontSize: fontSize - 1,
                lineHeight: (fontSize - 1) * 1.5,
              }}
            >
              "{devotional.scriptureText}"
            </Text>
          </View>

          {/* Body Paragraphs */}
          <View className="space-y-6 mb-10">
            {devotional.body.map((p, index) => (
              <Text
                key={index}
                className="text-[#1C1917] dark:text-[#F3F4F6] leading-[1.7] mb-4 font-sans"
                style={{
                  fontSize: fontSize,
                }}
              >
                {p}
              </Text>
            ))}
          </View>

          {/* Prayer Section Card */}
          <View className="bg-[#EEF2FF] dark:bg-[#1A1F36] p-6 rounded-2xl mb-8">
            <View className="flex-row items-center mb-3 gap-x-2">
              <Ionicons
                name="heart"
                size={20}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
              <Text className="text-sm font-bold uppercase tracking-wide text-[#1E40AF] dark:text-[#60A5FA]">
                Today's Prayer
              </Text>
            </View>
            <Text
              className="leading-relaxed text-[#1F2937] dark:text-[#E5E7EB] italic font-sans"
              style={{ fontSize: fontSize - 1 }}
            >
              {devotional.prayer}
            </Text>
          </View>

          {/* Reflection Section Card */}
          <View className="bg-[#FAF8F5] dark:bg-[#171717] p-6 rounded-2xl mb-8 border border-[#E0E1E6] dark:border-[#2E3135]">
            <View className="flex-row items-center mb-3 gap-x-2">
              <Ionicons
                name="help-circle"
                size={20}
                color={isDark ? "#D97706" : "#D97706"}
              />
              <Text className="text-sm font-bold uppercase tracking-wide text-[#D97706]">
                Today's Reflection
              </Text>
            </View>
            <Text
              className="leading-relaxed text-[#4B5563] dark:text-[#D1D5DB] font-medium"
              style={{ fontSize: fontSize - 1 }}
            >
              {devotional.reflection}
            </Text>
          </View>

          {/* Action Point Checklist */}
          <View className="mb-10">
            <Text className="text-sm font-bold uppercase tracking-wide text-[#60646C] dark:text-[#B0B4BA] mb-4">
              Action Points
            </Text>
            <View className="space-y-3">
              {devotional.actionPoints.map((action: string, idx: number) => {
                const key = `${devotional.id}-${idx}`;
                const checked = !!checkedActions[key];
                return (
                  <Pressable
                    key={idx}
                    onPress={() => toggleActionPoint(idx)}
                    className="flex-row items-start p-3 bg-[#FDFBF7] dark:bg-[#181818] rounded-xl border border-[#E0E1E6] dark:border-[#2E3135] mb-2 active:bg-[#F3EFE6] dark:active:bg-[#252525]"
                  >
                    <View className="mr-3 mt-0.5">
                      <Ionicons
                        name={checked ? "checkbox" : "square-outline"}
                        size={20}
                        color={checked ? "#1E40AF" : "#60646C"}
                      />
                    </View>
                    <Text
                      className={`flex-1 text-[#1C1917] dark:text-[#F3F4F6] text-sm leading-5 ${checked ? "line-through opacity-50" : ""}`}
                    >
                      {action}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Bottom Previous / Next Devotion Navigation */}
          <View className="flex-row justify-between items-center border-t border-[#E0E1E6] dark:border-[#2E3135] pt-6">
            {onPrev ? (
              <Pressable
                onPress={onPrev}
                className="flex-row items-center py-2 active:opacity-60"
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={18}
                  className="text-[#1E40AF] dark:text-[#60A5FA]"
                />
                <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] ml-1">
                  Previous
                </Text>
              </Pressable>
            ) : (
              <View />
            )}

            {onNext ? (
              <Pressable
                onPress={onNext}
                className="flex-row items-center py-2 active:opacity-60"
              >
                <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] mr-1">
                  Next Devotion
                </Text>
                <Ionicons
                  name="arrow-forward-outline"
                  size={18}
                  className="text-[#1E40AF] dark:text-[#60A5FA]"
                />
              </Pressable>
            ) : (
              <View />
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
