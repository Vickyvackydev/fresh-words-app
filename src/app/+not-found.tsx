import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function NotFoundScreen() {
  const router = useRouter();
  const { isDark } = useApp();

  const bgColor = isDark ? "bg-[#121212]" : "bg-[#FDFBF7]";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <SafeAreaView className={`flex-1 ${bgColor} justify-center items-center px-6`}>
      <View className="items-center text-center max-w-xs space-y-4">
        <View className="w-16 h-16 rounded-full bg-blue-500/10 items-center justify-center mb-2">
          <Ionicons name="compass-outline" size={32} color={isDark ? "#60A5FA" : "#1E40AF"} />
        </View>
        <Text className={`text-2xl font-bold font-serif ${textColor} text-center`}>
          Page Not Found
        </Text>
        <Text className={`text-sm leading-6 ${subtextColor} text-center`}>
          This link doesn't exist in Fresh Devotionals.
        </Text>
        <Pressable
          onPress={() => router.replace("/")}
          className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-blue-700 active:bg-blue-800 items-center"
        >
          <Text className="text-white font-semibold text-sm">
            Go to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
