import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { openAppInStore, AppUpdateCheckResult } from "../utils/appUpdate";
import { useApp } from "../context/AppContext";

interface UpdateModalProps {
  visible: boolean;
  updateInfo: AppUpdateCheckResult | null;
  onDismiss?: () => void;
}

export default function UpdateModal({
  visible,
  updateInfo,
  onDismiss,
}: UpdateModalProps) {
  const { isDark, t, appSettings } = useApp();

  if (!updateInfo || !visible) return null;

  const isAndroid = Platform.OS === "android";
  const storeButtonText = isAndroid
    ? t("openInPlayStore")
    : t("openInAppStore");

  const handleUpdate = () => {
    openAppInStore(appSettings);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!updateInfo.isForceUpdate && onDismiss) {
          onDismiss();
        }
      }}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
          ]}
        >
          {/* Top Badge Icon */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE" },
              ]}
            >
              <Ionicons
                name="cloud-download-outline"
                size={34}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
            </View>
          </View>

          {/* Version Pill */}
          <View style={styles.pillContainer}>
            <View
              style={[
                styles.versionPill,
                { backgroundColor: isDark ? "#2A2E37" : "#F1F5F9" },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={13}
                color={isDark ? "#60A5FA" : "#1E40AF"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.versionPillText,
                  { color: isDark ? "#93C5FD" : "#1E40AF" },
                ]}
              >
                v{updateInfo.latestVersion} {t("updateAvailable")}
              </Text>
            </View>
          </View>

          {/* Heading Title */}
          <Text
            style={[
              styles.title,
              { color: isDark ? "#F3F4F6" : "#111827" },
            ]}
          >
            {updateInfo.isForceUpdate
              ? t("updateRequired")
              : updateInfo.updateTitle || t("updateAvailable")}
          </Text>

          {/* Version Diff */}
          <Text
            style={[
              styles.versionSub,
              { color: isDark ? "#9CA3AF" : "#6B7280" },
            ]}
          >
            {t("currentVersion")}: {updateInfo.currentVersion} → {t("latestVersion")}:{" "}
            {updateInfo.latestVersion}
          </Text>

          {/* Release Message */}
          <View
            style={[
              styles.messageBox,
              { backgroundColor: isDark ? "#262930" : "#F8FAFC" },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isDark ? "#E5E7EB" : "#374151" },
              ]}
            >
              {updateInfo.updateMessage || t("newVersionAvailable")}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.primaryButton,
                { backgroundColor: isDark ? "#2563EB" : "#1E40AF" },
              ]}
              onPress={handleUpdate}
            >
              <Ionicons
                name={isAndroid ? "logo-google-playstore" : "logo-apple-appstore"}
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.primaryButtonText}>{storeButtonText}</Text>
            </TouchableOpacity>

            {!updateInfo.isForceUpdate && onDismiss && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.secondaryButton}
                onPress={onDismiss}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isDark ? "#9CA3AF" : "#6B7280" },
                  ]}
                >
                  {t("remindMeLater")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  pillContainer: {
    marginBottom: 10,
  },
  versionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  versionPillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  versionSub: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 14,
  },
  messageBox: {
    width: "100%",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: 10,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: "100%",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
