import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { getBaseUrl } from "@/api/client";
import { Devotional } from "@/db/mockDb";
import DevotionReader from "@/components/devotion-reader";

export default function DeepLinkedDevotionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, offlineDevotionals, bookmarks, toggleBookmark } = useApp();

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<"not_found" | "network_error" | null>(null);
  const [readerOpen, setReaderOpen] = useState(true);

  const formatDevotional = (raw: any): Devotional => {
    return {
      id: raw.id,
      category: raw.category || "Daily Devotional",
      title: raw.title || "Daily Devotional",
      date: `Day ${raw.default_day || 1}`,
      readingTime: Math.ceil(((raw.body || "").length || 1000) / 800),
      scriptureRef: raw.scripture_reference || raw.scriptureRef || "",
      scriptureText: raw.scripture_quote || raw.scriptureText || "",
      body:
        typeof raw.body === "string"
          ? raw.body.split("\n\n")
          : Array.isArray(raw.body)
            ? raw.body
            : [],
      prayer: raw.prayer || "",
      reflection: raw.reflection || "",
      actionPoints:
        typeof raw.action_points === "string"
          ? (raw.action_points.trim().startsWith("[")
              ? JSON.parse(raw.action_points || "[]")
              : [raw.action_points])
          : Array.isArray(raw.actionPoints)
            ? raw.actionPoints
            : [],
    };
  };

  const loadDevotional = async () => {
    if (!id || typeof id !== "string") {
      setErrorStatus("not_found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorStatus(null);

    // 1. Check local offline cache first
    const allDevs = Object.values(offlineDevotionals || {}).flat();
    const foundLocal = allDevs.find((d: any) => d && d.id === id);

    if (foundLocal) {
      setDevotional(formatDevotional(foundLocal));
      setLoading(false);
      setReaderOpen(true);
      return;
    }

    // 2. Fetch from backend API with 6-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/devotionals/${id}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setDevotional(formatDevotional(json.data));
        setReaderOpen(true);
      } else if (res.status === 404 || !json.success) {
        setErrorStatus("not_found");
      } else {
        setErrorStatus("network_error");
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        console.warn("Devotional deep-link request timed out.");
      }
      setErrorStatus("network_error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevotional();
  }, [id, offlineDevotionals]);

  const handleClose = () => {
    setReaderOpen(false);
    router.replace("/");
  };

  const isBookmarked = !!(devotional && bookmarks.includes(devotional.id));

  const bgColor = isDark ? "bg-[#121212]" : "bg-[#FDFBF7]";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg = isDark ? "bg-[#1C1C1E] border-[#2E3135]" : "bg-[#FAF8F5] border-[#E0E1E6]";

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${bgColor} justify-center items-center px-6`}>
        <ActivityIndicator size="large" color={isDark ? "#60A5FA" : "#1E40AF"} />
        <Text className={`mt-4 text-base font-medium ${subtextColor}`}>
          Loading shared devotional...
        </Text>
      </SafeAreaView>
    );
  }

  if (errorStatus === "not_found") {
    return (
      <SafeAreaView className={`flex-1 ${bgColor} justify-center items-center px-6`}>
        <View className={`w-full max-w-sm p-6 rounded-3xl border ${cardBg} items-center text-center space-y-4`}>
          <View className="w-16 h-16 rounded-full bg-amber-500/10 items-center justify-center mb-2">
            <Ionicons name="book-outline" size={32} color="#F59E0B" />
          </View>
          <Text className={`text-xl font-bold font-serif ${textColor} text-center`}>
            Devotional Not Found
          </Text>
          <Text className={`text-sm leading-6 ${subtextColor} text-center`}>
            The devotional link you tapped may have expired, been updated, or does not exist.
          </Text>
          <Pressable
            onPress={() => router.replace("/")}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-blue-700 active:bg-blue-800 items-center"
          >
            <Text className="text-white font-semibold text-sm">
              Go to Today's Devotional
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (errorStatus === "network_error") {
    return (
      <SafeAreaView className={`flex-1 ${bgColor} justify-center items-center px-6`}>
        <View className={`w-full max-w-sm p-6 rounded-3xl border ${cardBg} items-center text-center space-y-4`}>
          <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-2">
            <Ionicons name="cloud-offline-outline" size={32} color="#EF4444" />
          </View>
          <Text className={`text-xl font-bold font-serif ${textColor} text-center`}>
            Unable to Load Devotional
          </Text>
          <Text className={`text-sm leading-6 ${subtextColor} text-center`}>
            Please check your internet connection and try loading this shared devotional again.
          </Text>
          <View className="w-full space-y-2.5 pt-2">
            <Pressable
              onPress={loadDevotional}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-700 active:bg-blue-800 items-center"
            >
              <Text className="text-white font-semibold text-sm">
                Try Again
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/")}
              className="w-full py-3.5 px-6 rounded-2xl border border-gray-300 dark:border-gray-700 items-center"
            >
              <Text className={`font-semibold text-sm ${textColor}`}>
                Read Offline Devotionals
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className={`flex-1 ${bgColor}`}>
      {devotional && (
        <DevotionReader
          devotional={devotional}
          dateLabel={devotional.date}
          visible={readerOpen}
          onClose={handleClose}
          onToggleBookmark={(devId) => toggleBookmark(devId)}
          isBookmarked={isBookmarked}
        />
      )}
    </View>
  );
}
