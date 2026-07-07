import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingProps {
  onFinish: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const insets = useSafeAreaInsets();

  const pages = [
    {
      title: 'Daily Spiritual Growth',
      description: 'Receive daily devotionals that inspire and strengthen your walk with God.',
      icon: '🌱',
    },
    {
      title: 'Read Anywhere',
      description: 'Everything works completely offline after your first download. No internet needed.',
      icon: '📖',
    },
    {
      title: 'Bible & Devotional',
      description: 'Read Scripture, bookmark devotionals, and never miss your daily encouragement.',
      icon: '✨',
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View 
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212] justify-between"
      style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }}
    >
      {/* Top Header - Skip */}
      <View className="px-6 flex-row justify-end h-8">
        {currentPage < pages.length - 1 && (
          <Pressable 
            onPress={onFinish}
            hitSlop={12}
            className="active:opacity-60"
          >
            <Text className="text-sm font-medium text-[#60646C] dark:text-[#B0B4BA]">
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Content Carousel */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Large Aesthetic Illustration Wrapper */}
        <View className="w-56 h-56 bg-[#F3EFE6] dark:bg-[#1E1E1E] rounded-full items-center justify-center mb-10 shadow-sm">
          <Text className="text-7xl">{pages[currentPage].icon}</Text>
        </View>

        {/* Text Area */}
        <Text className="text-2xl font-bold text-center text-[#1C1917] dark:text-[#F3F4F6] mb-4">
          {pages[currentPage].title}
        </Text>
        <Text className="text-base text-center leading-6 text-[#60646C] dark:text-[#B0B4BA] max-w-xs">
          {pages[currentPage].description}
        </Text>
      </View>

      {/* Footer Area */}
      <View className="px-6 items-center">
        {/* Page Indicators */}
        <View className="flex-row justify-center space-x-2 mb-8">
          {pages.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentPage 
                  ? 'w-6 bg-[#1E40AF] dark:bg-[#60A5FA]' 
                  : 'w-2 bg-[#E0E1E6] dark:bg-[#2E3135]'
              }`}
            />
          ))}
        </View>

        {/* Primary Action Button */}
        <Pressable
          onPress={handleNext}
          className="w-full bg-[#1E40AF] dark:bg-[#2563EB] h-12 rounded-xl items-center justify-center active:opacity-90 active:scale-[0.99] transition-transform"
        >
          <Text className="text-white text-base font-semibold">
            {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
