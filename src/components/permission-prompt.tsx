import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PermissionPromptProps {
  onFinish: () => void;
}

export default function PermissionPrompt({ onFinish }: PermissionPromptProps) {
  const insets = useSafeAreaInsets();

  const handleEnable = () => {
    // In a real app we'd call Expo Notifications requestPermissionsAsync.
    // For this demonstration, we save approval status and proceed.
    onFinish();
  };

  return (
    <View 
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212] justify-between px-6"
      style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 30 }}
    >
      {/* Spacer or header */}
      <View />

      {/* Main visual & copy */}
      <View className="items-center">
        {/* Sunrise Illustration */}
        <View className="w-64 h-64 items-center justify-center mb-8 relative">
          {/* Golden Sun Glow */}
          <View className="absolute w-44 h-44 rounded-full bg-[#FEF3C7] dark:bg-[#2B2315] opacity-80" />
          <View className="absolute w-28 h-28 rounded-full bg-[#F59E0B] dark:bg-[#D97706] opacity-90 shadow-lg" />
          {/* Subtle Rays or Cloud elements */}
          <View className="absolute bottom-12 w-52 h-4 bg-[#FDFBF7] dark:bg-[#121212] rounded-full" />
          <Text className="text-5xl mt-6">🌅</Text>
        </View>

        <Text className="text-2xl font-bold text-center text-[#1C1917] dark:text-[#F3F4F6] mb-4">
          Never Miss Your Daily Devotion
        </Text>
        <Text className="text-base text-center leading-6 text-[#60646C] dark:text-[#B0B4BA] max-w-xs px-2">
          Receive your daily devotional every morning at your preferred time, even when offline.
        </Text>
      </View>

      {/* Buttons */}
      <View className="space-y-3">
        <Pressable
          onPress={handleEnable}
          className="w-full bg-[#1E40AF] dark:bg-[#2563EB] h-12 rounded-xl items-center justify-center active:opacity-90 active:scale-[0.99] transition-transform"
        >
          <Text className="text-white text-base font-semibold">
            Enable Notifications
          </Text>
        </Pressable>

        <Pressable
          onPress={onFinish}
          className="w-full h-12 rounded-xl items-center justify-center active:bg-[#F3EFE6] dark:active:bg-[#1E1E1E]"
        >
          <Text className="text-sm font-medium text-[#60646C] dark:text-[#B0B4BA]">
            Maybe Later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
