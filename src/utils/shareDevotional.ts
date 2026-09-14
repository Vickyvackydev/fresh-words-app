import { Share, Platform } from "react-native";
import { Devotional } from "../db/mockDb";

/**
 * Clean, app-to-app smart sharing for devotionals.
 * Produces a single canonical URL (https://freshdevotionals.com/devotional/:id)
 * that opens directly in the mobile app if installed, or redirects to
 * Google Play (Android) / Apple App Store (iOS) if not.
 */
export async function shareDevotional(devotional: Devotional | any) {
  if (!devotional) return;

  try {
    const id = devotional.id;
    const title = devotional.title || "Daily Devotional";
    const ref =
      devotional.scriptureRef || devotional.scripture_reference || "";

    // Extract first body paragraph or clean excerpt
    let bodyText = "";
    if (Array.isArray(devotional.body)) {
      bodyText = devotional.body[0] || "";
    } else if (typeof devotional.body === "string") {
      bodyText = devotional.body.split("\n\n")[0] || "";
    }

    // Clean snippet capped at ~180 chars
    const cleanSnippet = bodyText.trim()
      ? `\n\n${bodyText.trim().slice(0, 180)}${bodyText.length > 180 ? "..." : ""}`
      : "";

    const refText = ref ? ` (${ref})` : "";
    const shareUrl = `https://freshdevotionals.com/devotional/${id}`;

    const message = `📖 "${title}"${refText}${cleanSnippet}\n\nRead more on Fresh Devotionals:\n${shareUrl}`;

    if (Platform.OS === "ios") {
      // On iOS, Share.share automatically appends the `url` parameter if provided.
      // Providing both `message` with shareUrl and `url` causes WhatsApp/iMessage to print the URL twice.
      await Share.share({
        message,
      });
    } else {
      await Share.share({
        message,
        title,
      });
    }
  } catch (error) {
    console.warn("Error sharing devotional:", error);
  }
}
