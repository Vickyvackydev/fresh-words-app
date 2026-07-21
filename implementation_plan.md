# Devotional App - Fixes & Feature Implementation Plan

## Overview

This implementation plan combines the **Devotional Settings** feature (repurposing notification settings into category availability controls in admin and user preferences in the mobile app) with critical parser bug fixes, UI alignment corrections, terms/privacy browser links, and complete deployment build instructions.

---

## User Review Required

> [!IMPORTANT]
> - **Admin Devotional Settings Controls**: The delivery time and randomize controls remain fully visible (not hidden or collapsed).
>   - Delivery time set by admin acts as the default schedule for that category (overrideable by user in the mobile app).
>   - Randomization is **enabled by default** for *Daily Deliverance*, *Holiness*, and *Prayer*.
>   - Randomization is **disabled and locked** for *Yearly Devotional* (as it strictly follows calendar date order and must not reshuffle).
> - **Drop-Cap & Scripture Parsing**: The backend document parser changes modify PDF line sorting order and state machine rules in `fresh-words-backend/services/`. Newly uploaded documents (PDF and DOCX) will automatically use the enhanced parser engine.
> - **Terms & Privacy Links**: Links will default to `https://freshdevotionals.com/terms` and `https://freshdevotionals.com/privacy` (or use `privacy_policy_url` / `terms_of_service_url` if configured in admin `Settings`).

---

## Proposed Changes

### 1. Admin Panel (`fresh-words-admin`)

#### [MODIFY] [SidebarLayout.tsx](file:///C:/Users/USER/Desktop/fresh-words-admin/src/layout/SidebarLayout.tsx)
- Rename sidebar menu item from `"Notifications"` to `"Devotional Settings"`.

#### [MODIFY] [NotificationsView.tsx](file:///C:/Users/USER/Desktop/fresh-words-admin/src/ui/NotificationsView.tsx)
- Rename page title from `"Notification Manager"` to `"Devotional Settings"`.
- Update description: *"Control category availability and default delivery schedules for users."*
- **Keep Time & Randomize Controls Visible**:
  - Keep the time picker input/dropdown visible for each category.
  - Keep the randomize toggle visible. For *Daily Deliverance*, *Holiness*, and *Prayer*, default randomize to `true`.
  - For *Yearly Devotional*, keep randomize toggle disabled (`disabled={true}`, value `false`) with a clear helper text explaining that yearly devotionals follow exact calendar date order.

---

### 2. Document Parsing Engine (`fresh-words-backend`)

#### Generalized Devotional Parsing Logic

The current sequential state machine in `parser.go` is fragile because it expects a strict order of layout blocks (Date -> Title -> Scripture -> Body). If a document has unexpected line breaks, typos in headings, or merged paragraphs (common in both DOCX and PDF formats), the state machine fails and dumps everything into the `Body`, leaving the `ScriptureReference` and `ScriptureQuote` fields empty.

We will rewrite `extractDevotionals` in `parser.go` to use a **General Chunk-Based Parsing Logic** that does not rely on strict block transitions:

### 1. Chunking
- Iterate through the logical text blocks.
- Every time we encounter a Date (`isDateOrDay`), we slice all subsequent blocks until the next Date into a single "Devotional Chunk".

### 2. Heuristic Extraction per Chunk
For each Devotional Chunk, we perform string-based extraction:
- **Title**: The first non-empty block of the chunk.
- **Section Bucketing**: Iterate the remaining blocks and assign them to active sections (`Scripture`, `Body`, `Prayer`, `Reflection`, `ActionPoint`) based on heading keywords.
- **Fallback Structural Healing**:
  - If a Devotional is missing the `MESSAGE` header, the entire chunk will accidentally fall into the `Scripture` bucket. We will detect this (if `Body` is empty but `Scripture` is full) and intelligently split it. We will search the first few paragraphs of the chunk for a scripture reference (using `extractScripture`), treat that as the Quote boundary, and move the rest of the text into `Body`.
  - If a Devotional *does* have a `MESSAGE` header, but the author accidentally pasted the scripture and quote *inside* the message block (resulting in an empty `ScriptureQuote` field), we will search the first paragraph of the `Body` for a scripture reference. If found, we extract the reference and quote, and remove it from the `Body`.

### Files to Modify
#### [MODIFY] [pdf.go](file:///c:/Users/USER/Desktop/fresh-words-backend/services/extractor/pdf.go)
- **Top-Y Sorting for Drop-Caps**: When sorting extracted PDF words top-to-bottom, compute effective Y using text top bounds (`Y + FontSize`) for large drop-cap letters (Font size > 1.3x baseline text).
- **Line Alignment**: Prevents large drop-cap characters (like a 36pt "T") from falling onto line 2 in the raw word stream, ensuring they stay on line 1 alongside line 1 text.

#### [MODIFY] [layout.go](file:///c:/Users/USER/Desktop/fresh-words-backend/services/reconstructor/layout.go)
- **Enhanced Drop-Cap Merging**: Improve `mergeDropCaps` to handle drop-caps that land as single uppercase words (`"T"`) before lowercase words (`"he"` -> `"The"`), or misplaced drop-caps within the first sentence of body text.

#### [MODIFY] [parser.go](file:///c:/Users/USER/Desktop/fresh-words-backend/services/parser.go)
- **Scripture Quote & Reference Separation**:
  - Update `extractScripture` regex and logic: ignore standalone numbers/digits (e.g. `"1"` parsed from `"1 JOHN 5:18"`) or header text (e.g. `"SCRIPTURE READING:"`) as scripture quote text.
  - In `extractDevotionals`, handle explicit header labels (`SCRIPTURE READING:`, `SCRIPTURE LESSON:`, `BIBLE READING:`, `BIBLE TEXT:`) cleanly.
  - Parse quote text (e.g. `"We know that whosoever is born of God..."` or `"Behold, I will bring it health..."`) into `ScriptureQuote`.
  - Parse references (e.g. `JOHN 5:18`, `Jeremiah 33:6`) into `ScriptureReference`.
  - Transition state to `Body` ONLY after quote and reference are captured, ensuring full quote text does not leak into `Body` while leaving `ScriptureQuote` empty or set to `"1"`.

---

### 3. Mobile App (`fresh-words-app`)

#### [MODIFY] [AppContext.tsx](file:///C:/Users/USER/Desktop/fresh-words-app/src/context/AppContext.tsx) & [_layout.tsx](file:///C:/Users/USER/Desktop/fresh-words-app/src/app/_layout.tsx)
- Add `devotionalPrefs: Record<string, boolean>` to context (persisted to AsyncStorage under `"devotionalPrefs"`).
- Update offline sync (`syncOfflineDevotionals`) to fetch categories only if enabled by admin AND enabled in user `devotionalPrefs`.

#### [MODIFY] [settings.tsx](file:///C:/Users/USER/Desktop/fresh-words-app/src/app/settings.tsx)
- **Devotionals Category Preferences Section**: Add a "Devotionals" section with switches for each admin-enabled category.
- **Android TextInput Vertical Centering Fix**:
  - Add `style={{ paddingVertical: 0, textAlignVertical: "center", includeFontPadding: false }}` to the "Your Name" `TextInput`.
  - Adjust height and alignment to ensure text (`e.g. Victor`) is centered without clipping on Android OS.
- **Terms & Privacy Policy Browser Links**:
  - In the "About Fresh Words" modal/section, add clickable "Terms of Service" and "Privacy Policy" rows/buttons using React Native `Linking.openURL()`.

---

## Build & Deployment Plans

### 1. Instant Preview / APK Download (Android)
To generate a standalone APK for testing on Android devices:
```bash
cd c:\Users\USER\Desktop\fresh-words-app
eas build --profile preview --platform android
```
*(Once build completes, EAS provides a direct download link for the `.apk` file).*

### 2. Production Build for Google Play Store (Android AAB)
```bash
# Build Android App Bundle (.aab)
eas build --profile production --platform android

# Submit to Google Play Console
eas submit --platform android
```

### 3. Production Build for Apple App Store (iOS IPA)
```bash
# Build iOS App Archive (.ipa)
eas build --profile production --platform ios

# Submit to App Store Connect
eas submit --platform ios
```

---

## Verification Plan

### Automated Tests & Parsing Checks
- Run Go backend tests: `go test ./...` in `fresh-words-backend`.
- Create mock tests with PDF/DOCX samples containing drop caps and scripture readings (`JOHN 5:18`, `Jeremiah 33:6`) to verify zero drop-cap displacement and 100% quote extraction accuracy.

### Manual Verification
1. **Admin Panel**:
   - Check sidebar nav label `"Devotional Settings"`.
   - Verify category delivery time and randomize toggles remain visible.
   - Verify *Daily Deliverance*, *Holiness*, and *Prayer* have randomize enabled by default.
   - Verify *Yearly Devotional* randomize toggle is disabled (`disabled={true}`).
2. **Mobile App**:
   - Open Settings screen on Android device / emulator.
   - Verify "Your Name" text input is vertically aligned without clipping.
   - Open "About" section, tap "Terms of Service" and "Privacy Policy" links; verify browser opens correctly.
   - Check "Devotionals" category switches.
3. **EAS Build**:
   - Trigger `eas build --profile preview --platform android` and verify APK output.
