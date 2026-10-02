import { Linking, Platform } from "react-native";
import Constants from "expo-constants";

export const DEFAULT_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.freshdevotionals.app";
export const DEFAULT_APP_STORE_URL =
  "https://apps.apple.com/app/fresh-devotionals/id6742352824";
export const ANDROID_PACKAGE_NAME = "com.freshdevotionals.app";
export const IOS_APP_ID = "6742352824";

/**
 * Returns the current installed app version from Expo constants or app.json
 */
export function getCurrentAppVersion(): string {
  return (
    Constants.expoConfig?.version ||
    (Constants as any).nativeAppVersion ||
    "1.0.3"
  );
}

/**
 * Compares two semantic version strings (e.g. "1.0.3" vs "1.0.2").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareAppVersions(v1: string, v2: string): number {
  if (!v1 || !v2) return 0;
  const parts1 = v1.replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const parts2 = v2.replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Opens Google Play or Apple App Store directly to the app's install/update page.
 */
export async function openAppInStore(settings?: any): Promise<void> {
  const isAndroid = Platform.OS === "android";
  const isIOS = Platform.OS === "ios";

  if (isAndroid) {
    const marketUri = `market://details?id=${ANDROID_PACKAGE_NAME}`;
    const webUri = settings?.play_store_url || DEFAULT_PLAY_STORE_URL;
    try {
      const canOpen = await Linking.canOpenURL(marketUri);
      if (canOpen) {
        await Linking.openURL(marketUri);
        return;
      }
    } catch {
      // Fallback to web link
    }
    await Linking.openURL(webUri).catch((err) =>
      console.warn("Could not open Play Store URL:", err)
    );
  } else if (isIOS) {
    const itmsUri = `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}?mt=8`;
    const webUri = settings?.app_store_url || DEFAULT_APP_STORE_URL;
    try {
      const canOpen = await Linking.canOpenURL(itmsUri);
      if (canOpen) {
        await Linking.openURL(itmsUri);
        return;
      }
    } catch {
      // Fallback to web link
    }
    await Linking.openURL(webUri).catch((err) =>
      console.warn("Could not open App Store URL:", err)
    );
  } else {
    // Web / Other
    const webUri = settings?.play_store_url || DEFAULT_PLAY_STORE_URL;
    await Linking.openURL(webUri).catch(() => {});
  }
}

export interface AppUpdateCheckResult {
  isUpdateAvailable: boolean;
  isForceUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateTitle: string;
  updateMessage: string;
  storeUrl: string;
}

/**
 * Evaluates whether an update is available based on appSettings and current version.
 */
export function checkAppUpdateStatus(
  settings: any,
  currentVersion: string = getCurrentAppVersion()
): AppUpdateCheckResult {
  const latestVersion = settings?.latest_app_version || currentVersion;
  const minRequiredVersion = settings?.min_required_version || "1.0.0";
  const forceUpdateFlag = Boolean(settings?.force_update);

  const hasNewerVersion = compareAppVersions(latestVersion, currentVersion) > 0;
  const belowMinRequired = compareAppVersions(minRequiredVersion, currentVersion) > 0;
  const isForceUpdate = hasNewerVersion && (forceUpdateFlag || belowMinRequired);

  const defaultStoreUrl =
    Platform.OS === "ios"
      ? settings?.app_store_url || DEFAULT_APP_STORE_URL
      : settings?.play_store_url || DEFAULT_PLAY_STORE_URL;

  return {
    isUpdateAvailable: hasNewerVersion,
    isForceUpdate,
    latestVersion,
    currentVersion,
    updateTitle: settings?.update_title || "Update Available",
    updateMessage:
      settings?.update_message ||
      "A new version of Fresh Devotionals is available with improved translations, bible features, and performance enhancements.",
    storeUrl: defaultStoreUrl,
  };
}
