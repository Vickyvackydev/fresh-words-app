import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSubmitFeedback } from "../api/hooks";

let Notifications: any = null;
try {
  const isExpoGo = Constants.appOwnership === "expo";
  if (!(Platform.OS === "android" && isExpoGo)) {
    Notifications = require("expo-notifications");
  }
} catch (e) {
  console.warn("Failed to load expo-notifications:", e);
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    isDark,
    setIsDark,
    fontSize,
    setFontSize,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationTime,
    setNotificationTime,
    appSettings,
    syncOfflineDevotionals,
    isSyncing,
    offlineDevotionals,
    userName,
    setUserName,
  } = useApp();

  // Settings modals
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const [rateUsVisible, setRateUsVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  // Time picker modal states
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempHour, setTempHour] = useState("07");
  const [tempMinute, setTempMinute] = useState("00");

  const openTimePicker = () => {
    const parts = (notificationTime || "07:00").split(":");
    if (parts.length >= 2) {
      setTempHour(parts[0]);
      setTempMinute(parts[1]);
    }
    setTimePickerVisible(true);
  };

  const saveTimePicker = () => {
    const formatted = `${tempHour.padStart(2, "0")}:${tempMinute.padStart(2, "0")}`;
    setNotificationTime(formatted);
    setTimePickerVisible(false);
  };

  const triggerSync = async () => {
    try {
      await syncOfflineDevotionals();
    } catch (e) {
      alert("Failed to sync devotionals: " + (e as any).message);
    }
  };

  const triggerTestNotification = async () => {
    if (!Notifications) {
      alert(
        "Notifications are disabled in Expo Go Android. To test notifications, please run on an emulator or a development build, or use an iOS device.",
      );
      return;
    }
    try {
      const activeCategory = appSettings?.daily_deliverance_enabled
        ? "Daily Deliverance"
        : appSettings?.yearly_devotional_enabled
          ? "Yearly Devotional"
          : "Daily Deliverance";
      const catDevs = offlineDevotionals[activeCategory] || [];
      const firstDev = catDevs[0];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: firstDev
            ? firstDev.title || "Test Daily Devotional 🕊️"
            : "Test Daily Devotional 🕊️",
          body: firstDev
            ? "Today's devotional is ready — Tap to read now"
            : "This is your test notification! Tap to open.",
          data: {
            category: firstDev ? firstDev.category : "Daily Deliverance",
            devotionalId: firstDev ? firstDev.id : "",
          },
        },
        trigger: {
          type: "timeInterval",
          seconds: 5,
        } as any,
      });
      alert(
        "Test notification scheduled! Put the app in background (go to home screen) immediately.",
      );
    } catch (e) {
      alert("Failed to schedule test notification: " + (e as any).message);
    }
  };

  const submitFeedbackMutation = useSubmitFeedback();

  const handleFeedbackSubmit = () => {
    if (!feedbackMessage.trim()) return;
    setSubmittingFeedback(true);

    submitFeedbackMutation.mutate(
      {
        name: "Mobile App User",
        email: feedbackEmail || "anonymous@freshwords.app",
        message: feedbackMessage,
      },
      {
        onSuccess: () => {
          setSubmittingFeedback(false);
          setFeedbackSuccess(true);
          setTimeout(() => {
            setFeedbackSuccess(false);
            setFeedbackVisible(false);
            setFeedbackMessage("");
            setFeedbackEmail("");
          }, 1500);
        },
        onError: (err: any) => {
          setSubmittingFeedback(false);
          alert(
            "Failed to submit feedback: " + (err.message || "Unknown error"),
          );
        },
      },
    );
  };

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
        <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] mb-8">
          Settings
        </Text>

        {/* Section 1: Appearance */}
        <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
          Appearance
        </Text>
        <View
          className={`bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-5 gap-y-4 mb-6`}
        >
          {/* Profile Name */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                Your Name
              </Text>
              <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                Used for in-app greetings
              </Text>
            </View>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="e.g. Victor"
              placeholderTextColor={isDark ? "#888" : "#A3A3A3"}
              className="w-32 h-9 px-3 bg-[#FAF8F5] dark:bg-[#252527] border border-[#E0E1E6] dark:border-[#3E4249] rounded-xl text-sm text-[#1C1917] dark:text-[#F3F4F6] text-right font-semibold"
              maxLength={15}
              autoCorrect={false}
            />
          </View>

          {/* Divider */}
          <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135]" />

          {/* Theme */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                Dark Theme
              </Text>
              <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                Activate dark mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={setIsDark}
              trackColor={{ false: "#E0E1E6", true: "#1E40AF" }}
              thumbColor={Platform.OS === "android" ? "#FAF8F5" : undefined}
            />
          </View>

          {/* Divider */}
          <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135]" />

          {/* Typography font size */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                Reader Font Size
              </Text>
              <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                Default size: {fontSize}px
              </Text>
            </View>
            <View className="flex-row items-center gap-x-3">
              <Pressable
                onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#2E3135] border border-[#E0E1E6] dark:border-[#3E4249] justify-center items-center active:opacity-60"
              >
                <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6]">
                  -
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFontSize(Math.min(26, fontSize + 2))}
                className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#2E3135] border border-[#E0E1E6] dark:border-[#3E4249] justify-center items-center active:opacity-60"
              >
                <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6]">
                  +
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Section 2: Notifications */}
        <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
          Reminders
        </Text>
        <View className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-5 gap-y-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                Enable Notifications
              </Text>
              <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                Receive morning devotions
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E0E1E6", true: "#1E40AF" }}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135]" />
              <Pressable
                onPress={openTimePicker}
                className="flex-row justify-between items-center active:opacity-75 py-1"
              >
                <View>
                  <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                    Reminder Time
                  </Text>
                  <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                    Current scheduled hour
                  </Text>
                </View>
                <View className="px-3.5 py-1.5 bg-[#FAF8F5] dark:bg-[#2E3135] rounded-xl border border-[#E0E1E6] dark:border-[#3E4249]">
                  <Text className="text-sm font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                    {notificationTime || "07:00"}
                  </Text>
                </View>
              </Pressable>
            </>
          )}
        </View>

        {/* Section 3: Offline Storage */}
        <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
          Offline Storage
        </Text>
        <View className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-5 gap-y-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                Offline Devotional Cache
              </Text>
              {isSyncing ? (
                <View className="flex-row items-center gap-x-2 mt-2">
                  <ActivityIndicator size="small" color="#1E40AF" />
                  <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                    Synchronizing devotionals...
                  </Text>
                </View>
              ) : (
                <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] mt-0.5">
                  All active packages cached offline
                </Text>
              )}
            </View>
            <Pressable
              onPress={triggerSync}
              disabled={isSyncing}
              className={`py-1.5 px-3 rounded-lg active:opacity-75 ${isSyncing ? "bg-transparent" : "bg-[#E0E1E6] dark:bg-[#2E3135]"}`}
            >
              <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                {isSyncing ? "Syncing..." : "Re-sync"}
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135]" />

          {/* Notification testing */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                Notification Testing
              </Text>
              <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] mt-0.5">
                Trigger a test daily reminder in 5 seconds
              </Text>
            </View>
            <Pressable
              onPress={triggerTestNotification}
              className="py-1.5 px-3 rounded-lg bg-[#E0E1E6] dark:bg-[#2E3135] active:opacity-75"
            >
              <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                Test (5s)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Section 4: Support & Actions */}
        <Text className="text-xs font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
          Support
        </Text>
        <View className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-3xl p-5 mb-8">
          {/* Feedback */}
          <Pressable
            onPress={() => setFeedbackVisible(true)}
            className="flex-row justify-between items-center py-2 active:opacity-60"
          >
            <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
              Send Feedback
            </Text>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={16}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
          </Pressable>

          <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135] my-3" />

          {/* Rate Us */}
          <Pressable
            onPress={() => setRateUsVisible(true)}
            className="flex-row justify-between items-center py-2 active:opacity-60"
          >
            <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
              Rate the App
            </Text>
            <Ionicons
              name="star-outline"
              size={16}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
          </Pressable>

          <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135] my-3" />

          {/* About */}
          <Pressable
            onPress={() => setAboutVisible(true)}
            className="flex-row justify-between items-center py-2 active:opacity-60"
          >
            <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
              About Fresh Words
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* A. Feedback Modal Form */}
      <Modal visible={feedbackVisible} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="bg-[#FDFBF7] dark:bg-[#1E1E1E] rounded-t-3xl border-t border-[#E0E1E6] dark:border-[#2E3135] p-6 space-y-4"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                Send Feedback
              </Text>
              <Pressable onPress={() => setFeedbackVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            </View>

            {feedbackSuccess ? (
              <View className="items-center py-10">
                <Ionicons name="checkmark-circle" size={56} color="#10B981" />
                <Text className="text-lg font-bold text-[#1C1917] dark:text-[#F3F4F6] mt-4 font-serif">
                  Thank You
                </Text>
                <Text className="text-sm text-[#60646C] dark:text-[#B0B4BA] mt-2">
                  Your feedback has been sent.
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  value={feedbackEmail}
                  onChangeText={setFeedbackEmail}
                  placeholder="Email (optional)"
                  placeholderTextColor={isDark ? "#B0B4BA" : "#60646C"}
                  keyboardType="email-address"
                  className="bg-[#FAF8F5] dark:bg-[#2E3135] h-12 rounded-xl px-4 text-[#1C1917] dark:text-[#F3F4F6] border border-[#E0E1E6] dark:border-[#3E4249] mb-5"
                />
                <TextInput
                  value={feedbackMessage}
                  onChangeText={setFeedbackMessage}
                  placeholder="Your message..."
                  placeholderTextColor={isDark ? "#B0B4BA" : "#60646C"}
                  multiline={true}
                  className="bg-[#FAF8F5] dark:bg-[#2E3135] h-32 rounded-xl p-4 text-[#1C1917] dark:text-[#F3F4F6] border border-[#E0E1E6] dark:border-[#3E4249] text-left"
                  textAlignVertical="top"
                />
                <Pressable
                  onPress={handleFeedbackSubmit}
                  disabled={submittingFeedback}
                  className="w-full bg-[#1E40AF] mt-5 dark:bg-[#2563EB] h-12 rounded-xl items-center justify-center active:opacity-90 mt-2"
                >
                  {submittingFeedback ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">
                      Submit Feedback
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* B. Rate Us Modal Dialog */}
      <Modal visible={rateUsVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-[#FDFBF7] dark:bg-[#1E1E1E] border border-[#E0E1E6] dark:border-[#2E3135] w-full max-w-sm rounded-3xl p-6 items-center">
            <View className="w-16 h-16 bg-[#EEF2FF] dark:bg-[#1A1F36] rounded-full items-center justify-center mb-4">
              <Ionicons
                name="star"
                size={28}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
            </View>
            <Text className="text-xl font-bold text-center text-[#1C1917] dark:text-[#F3F4F6] mb-2 font-serif">
              Love the App?
            </Text>
            <Text className="text-sm text-center leading-5 text-[#60646C] dark:text-[#B0B4BA] mb-6">
              Your ratings help us spread encouraging messages around the world.
            </Text>
            <Pressable
              onPress={() => setRateUsVisible(false)}
              className="w-full bg-[#1E40AF] dark:bg-[#2563EB] h-12 rounded-xl items-center justify-center active:opacity-90 mb-3"
            >
              <Text className="text-white text-sm font-semibold">
                Rate on Store
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRateUsVisible(false)}
              className="w-full h-11 rounded-xl items-center justify-center active:bg-[#F3EFE6] dark:active:bg-[#2E3135]"
            >
              <Text className="text-sm font-medium text-[#60646C] dark:text-[#B0B4BA]">
                Later
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* C. About Modal Dialog */}
      <Modal visible={aboutVisible} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="bg-[#FDFBF7] dark:bg-[#1E1E1E] rounded-t-3xl border-t border-[#E0E1E6] dark:border-[#2E3135] p-6 space-y-4"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                About {appSettings?.church_name || "Fresh Words"}
              </Text>
              <Pressable onPress={() => setAboutVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            </View>

            <View className="items-center py-4">
              <View className="w-16 h-16 bg-[#FAF8F5] dark:bg-[#252527] rounded-2xl items-center justify-center shadow-xs mb-3 overflow-hidden">
                {appSettings?.app_logo_url ? (
                  <Image
                    source={{ uri: appSettings.app_logo_url }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Text className="text-3xl">🕊️</Text>
                )}
              </View>
              <Text className="text-lg font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif text-center">
                {appSettings?.church_name || "Fresh Words Devotional"}
              </Text>
              <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] mb-4">
                Version 1.0.0 (Build 1)
              </Text>
            </View>

            <Text className="text-sm leading-6 text-[#4B5563] dark:text-[#D1D5DB] text-center">
              {appSettings?.about_us ||
                "Our mission is to help people grow closer to God daily by providing distraction-free spiritual materials, scriptures, and reminders entirely offline."}
            </Text>

            <View className="h-px bg-[#E0E1E6] dark:bg-[#2E3135] my-4" />

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
                  Church Alliance
                </Text>
                <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  {appSettings?.church_name || "Global Fellowship"}
                </Text>
              </View>
              {appSettings?.support_email && (
                <View className="flex-row justify-between">
                  <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
                    Support Email
                  </Text>
                  <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                    {appSettings.support_email}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-[#60646C] dark:text-[#B0B4BA]">
                  Developer
                </Text>
                <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  Antigravity Labs
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* D. Custom Time Picker Modal */}
      <Modal
        visible={timePickerVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="bg-[#FDFBF7] dark:bg-[#1E1E1E] rounded-t-3xl border-t border-[#E0E1E6] dark:border-[#2E3135] p-6 space-y-4"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                Select Reminder Time
              </Text>
              <Pressable onPress={() => setTimePickerVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            </View>

            {/* Selector Grid */}
            <View className="flex-row h-56 gap-x-4">
              {/* Hour Column */}
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-2 text-center">
                  Hour
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="bg-[#FAF8F5] dark:bg-[#1C1C1E] rounded-2xl border border-[#E0E1E6] dark:border-[#2E3135] p-2"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hStr = i.toString().padStart(2, "0");
                    const isSelected = tempHour === hStr;
                    return (
                      <Pressable
                        key={hStr}
                        onPress={() => setTempHour(hStr)}
                        className={`py-2.5 rounded-xl items-center mb-1.5 active:scale-95 ${
                          isSelected
                            ? "bg-[#1E40AF] dark:bg-[#2563EB]"
                            : "bg-transparent"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${isSelected ? "text-white" : "text-[#1C1917] dark:text-[#F3F4F6]"}`}
                        >
                          {hStr}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Minute Column */}
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-2 text-center">
                  Minute
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="bg-[#FAF8F5] dark:bg-[#1C1C1E] rounded-2xl border border-[#E0E1E6] dark:border-[#2E3135] p-2"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const mVal = (i * 5).toString().padStart(2, "0");
                    const isSelected = tempMinute === mVal;
                    return (
                      <Pressable
                        key={mVal}
                        onPress={() => setTempMinute(mVal)}
                        className={`py-2.5 rounded-xl items-center mb-1.5 active:scale-95 ${
                          isSelected
                            ? "bg-[#1E40AF] dark:bg-[#2563EB]"
                            : "bg-transparent"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${isSelected ? "text-white" : "text-[#1C1917] dark:text-[#F3F4F6]"}`}
                        >
                          {mVal}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Confirm Actions */}
            <View className="flex-row gap-x-3 pt-2">
              <Pressable
                onPress={() => setTimePickerVisible(false)}
                className="flex-1 h-11 bg-[#FAF8F5] dark:bg-[#2E3135] border border-[#E0E1E6] dark:border-[#3E4249] rounded-xl items-center justify-center active:bg-[#F3EFE6]"
              >
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={saveTimePicker}
                className="flex-1 h-11 bg-[#1E40AF] dark:bg-[#2563EB] rounded-xl items-center justify-center active:opacity-90"
              >
                <Text className="text-white text-sm font-semibold">
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
