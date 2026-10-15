import { useApp } from "@/context/AppContext";
import { Hymn } from "@/db/hymns";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { getBaseUrl } from "../../api/client";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Share,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export function stripLeadingVerseNumber(verse: string): string {
  if (!verse) return "";
  return verse.replace(/^\s*\d+[\.\:\)\-]+\s*/, "").trim();
}

function getVersesList(verses: any): string[] {
  if (!verses) return [];
  let list: string[] = [];
  if (Array.isArray(verses)) {
    list = verses;
  } else if (typeof verses === "string") {
    try {
      const parsed = JSON.parse(verses);
      if (Array.isArray(parsed)) list = parsed;
      else list = [verses];
    } catch {
      list = [verses];
    }
  }
  return list
    .filter((v) => typeof v === "string" && v.trim() !== "" && v !== "null")
    .map(stripLeadingVerseNumber);
}

interface StanzaItem {
  id: string;
  type: "stanza" | "chorus";
  number?: number;
  text: string;
}

export default function HymnReaderScreen() {
  const insets = useSafeAreaInsets();
  const { id, book } = useLocalSearchParams<{ id: string; book?: string }>();
  const {
    isDark,
    offlineHymns,
    offlineHymnsYo,
    activeHymnalBook,
    hymnBookmarks,
    hymnBookmarksYo,
    toggleHymnBookmark,
    language,
    t,
  } = useApp();

  const currentBook = (book as "english" | "yoruba") || activeHymnalBook;
  const currentHymns = currentBook === "yoruba" ? offlineHymnsYo : offlineHymns;
  const currentBookmarks = currentBook === "yoruba" ? hymnBookmarksYo : hymnBookmarks;

  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [jumpNumber, setJumpNumber] = useState("");

  const currentHymnNumber = useMemo(() => {
    return parseInt(id || "1", 10);
  }, [id]);

  // Find the current hymn
  const hymn = useMemo<Hymn | undefined>(() => {
    return (
      currentHymns.find((h) => h.number === currentHymnNumber) ||
      currentHymns[0]
    );
  }, [currentHymns, currentHymnNumber]);

  // Dynamic multi-language translation state
  const [translatedHymn, setTranslatedHymn] = useState<Hymn | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    if (!language || language === "en" || !hymn || currentBook === "yoruba") {
      setTranslatedHymn(null);
      setIsTranslating(false);
      return;
    }

    let isMounted = true;
    setIsTranslating(true);
    const baseUrl = getBaseUrl();
    fetch(`${baseUrl}/hymns/${hymn.number}?lang=${language}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setTranslatedHymn(json.data);
        }
      })
      .catch((err) => {
        console.warn("Hymn translation deferred:", err);
      })
      .finally(() => {
        if (isMounted) setIsTranslating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hymn?.number, language, currentBook]);

  const activeHymn = translatedHymn || hymn;

  // Find previous and next hymns
  const prevHymn = useMemo(() => {
    const sorted = [...currentHymns].sort((a, b) => a.number - b.number);
    const currentIndex = sorted.findIndex((h) => h.number === hymn?.number);
    return currentIndex > 0 ? sorted[currentIndex - 1] : null;
  }, [currentHymns, hymn]);

  const nextHymn = useMemo(() => {
    const sorted = [...currentHymns].sort((a, b) => a.number - b.number);
    const currentIndex = sorted.findIndex((h) => h.number === hymn?.number);
    return currentIndex >= 0 && currentIndex < sorted.length - 1
      ? sorted[currentIndex + 1]
      : null;
  }, [currentHymns, hymn]);

  const isBookmarked = hymn ? currentBookmarks.includes(hymn.number) : false;

  // Navigate to another hymn
  const navigateToHymn = (num: number) => {
    router.replace({
      pathname: "/hymn/[id]",
      params: { id: num.toString(), book: currentBook },
    });
  };

  const handleJumpSubmit = () => {
    const num = parseInt(jumpNumber.trim(), 10);
    if (!isNaN(num) && num > 0) {
      setJumpModalVisible(false);
      setJumpNumber("");
      navigateToHymn(num);
    }
  };

  // Share Hymn
  const handleShare = async () => {
    if (!activeHymn) return;
    try {
      const verses = getVersesList(activeHymn.verses);
      let content = `HYMN #${activeHymn.number}: ${activeHymn.title}\n`;
      if (activeHymn.author) content += `Author: ${activeHymn.author}\n`;
      if (activeHymn.key) content += `Key: ${activeHymn.key}\n`;
      content += "\n";

      verses.forEach((v, idx) => {
        content += `${idx + 1}.\n${v}\n\n`;
        if (idx === 0 && activeHymn.chorus) {
          content += `[CHORUS]\n${activeHymn.chorus}\n\n`;
        }
      });

      content += `\nShared from Fresh Words Hymnal`;
      await Share.share({
        message: content,
        title: `Hymn #${activeHymn.number} - ${activeHymn.title}`,
      });
    } catch {}
  };

  // Stanza items mapped for FlatList
  const readerItems = useMemo<StanzaItem[]>(() => {
    if (!activeHymn) return [];
    const items: StanzaItem[] = [];
    const verses = getVersesList(activeHymn.verses);

    verses.forEach((v, idx) => {
      items.push({
        id: `stanza-${idx + 1}`,
        type: "stanza",
        number: idx + 1,
        text: v,
      });

      if (idx === 0 && activeHymn.chorus?.trim()) {
        items.push({
          id: "chorus-1",
          type: "chorus",
          text: activeHymn.chorus.trim(),
        });
      }
    });

    if (verses.length === 0 && activeHymn.chorus?.trim()) {
      items.push({
        id: "chorus-standalone",
        type: "chorus",
        text: activeHymn.chorus.trim(),
      });
    }

    return items;
  }, [activeHymn]);

  if (!hymn || !activeHymn) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-[#FDFBF7] dark:bg-[#121212]">
        <Text className="text-base text-[#60646C] dark:text-[#B0B4BA] font-serif">
          Hymn not found.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#1E40AF] dark:bg-[#2563EB] rounded-xl"
        >
          <Text className="text-white font-semibold">Back to Hymnal</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header Bar (Matching Bible Screen) */}
      <View className="px-6 py-3 border-b border-[#E0E1E6] dark:border-[#2E3135] flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={15}
          className="flex-row items-center active:opacity-60"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#F3F4F6" : "#1C1917"}
          />
          <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6] ml-1">
            Hymnal
          </Text>
        </Pressable>

        <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
          Hymn #{hymn.number}
        </Text>

        <View className="flex-row items-center gap-x-2">
          {/* Bookmark Button */}
          <Pressable
            onPress={() => toggleHymnBookmark(hymn.number, currentBook)}
            hitSlop={10}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] items-center justify-center active:opacity-70"
          >
            <Ionicons
              name={isBookmarked ? "star" : "star-outline"}
              size={18}
              color={isBookmarked ? "#D97706" : isDark ? "#B0B4BA" : "#60646C"}
            />
          </Pressable>

          {/* Share Button */}
          <Pressable
            onPress={handleShare}
            hitSlop={10}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] items-center justify-center active:opacity-70"
          >
            <Ionicons
              name="share-outline"
              size={18}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
          </Pressable>
        </View>
      </View>

      {/* Verses & Stanzas Mapped with FlatList */}
      <FlatList
        data={readerItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="mb-6 items-center">
            {isTranslating && (
              <View className="flex-row items-center justify-center py-2 px-4 mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 gap-x-2 w-full">
                <ActivityIndicator size="small" color={isDark ? "#60A5FA" : "#1E40AF"} />
                <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {language === "yo" ? t("loadingYorubaHymn") : t("translatingContent")}
                </Text>
              </View>
            )}

            {currentBook === "yoruba" ? (
              <View className="flex-row items-center py-1 px-3.5 mb-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 gap-x-1.5">
                <Ionicons name="book-outline" size={13} color={isDark ? "#34D399" : "#059669"} />
                <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Ìwé Orin Mímọ́ (Yorùbá)
                </Text>
              </View>
            ) : (
              language === "yo" && !isTranslating && !(activeHymn.is_translated || (translatedHymn && (translatedHymn.title !== hymn?.title || translatedHymn.verses !== hymn?.verses))) && (
                <View className="flex-row items-center py-2 px-3 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 gap-x-2 w-full">
                  <Ionicons name="information-circle-outline" size={16} color={isDark ? "#FBBF24" : "#D97706"} />
                  <Text className="text-xs text-amber-800 dark:text-amber-200 flex-1 leading-relaxed">
                    {t("officialYorubaPending")}
                  </Text>
                </View>
              )
            )}

            {/* Hymn Title */}
            <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] text-center leading-tight mb-2">
              {activeHymn.title}
            </Text>

            {/* Subtitle Badges */}
            <View className="flex-row flex-wrap justify-center gap-2 mt-1">
              {activeHymn.author && (
                <View className="bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] px-3 py-1 rounded-full">
                  <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                    {activeHymn.author.replace(/Christ Apostolic Church\s*(\(CAC\))?\s*(Worldwide)?/gi, "Ìwé Orin Mímọ́").replace(/\bCAC\b(\s*Worldwide)?/gi, "Ìwé Orin Mímọ́")}
                  </Text>
                </View>
              )}
              {activeHymn.key && (
                <View className="bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] px-3 py-1 rounded-full">
                  <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                    {activeHymn.key}
                  </Text>
                </View>
              )}
              {activeHymn.category && (
                <View className="bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] px-3 py-1 rounded-full">
                  <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA]">
                    {activeHymn.category.replace(/\bCAC\b/gi, "Mímọ́").replace(/Christ Apostolic Church/gi, "Orin Mímọ́")}
                  </Text>
                </View>
              )}
            </View>
            <View className="w-16 h-[2px] bg-[#E0E1E6] dark:border-[#2E3135] rounded-full my-5" />
          </View>
        )}
        renderItem={({ item }) => {
          if (item.type === "chorus") {
            return (
              <View className="my-4 bg-[#FAF8F5] dark:bg-[#1C1C1E] border-l-4 border-[#1E40AF] dark:border-[#2563EB] p-4 rounded-r-2xl shadow-xs">
                <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA] tracking-wider uppercase mb-2">
                  [Chorus]
                </Text>
                <Text className="text-base font-serif italic text-[#1C1917] dark:text-[#F3F4F6] leading-7">
                  {item.text}
                </Text>
              </View>
            );
          }

          return (
            <View className="flex-row items-start mb-6">
              {/* Stanza Number Badge */}
              <View className="w-7 h-7 rounded-full bg-[#EEF2FF] dark:bg-[#1A1F36] items-center justify-center mr-3 mt-1 shrink-0">
                <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                  {item.number}
                </Text>
              </View>
              {/* Stanza Lyrics */}
              <View className="flex-1">
                <Text className="text-base font-serif text-[#1C1917] dark:text-[#F3F4F6] leading-7">
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Chapter-style Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#FAF8F5] dark:bg-[#1C1C1E] border-t border-[#E0E1E6] dark:border-[#2E3135] px-6 py-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => prevHymn && navigateToHymn(prevHymn.number)}
          disabled={!prevHymn}
          className={`flex-row items-center py-2 px-3 rounded-xl bg-white dark:bg-[#272730] border border-[#E0E1E6] dark:border-[#2E3135] ${
            !prevHymn ? "opacity-30" : "active:opacity-70"
          }`}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={isDark ? "#60A5FA" : "#1E40AF"}
          />
          <Text className="text-xs font-semibold text-[#1E40AF] dark:text-[#60A5FA] ml-1">
            Previous
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setJumpModalVisible(true)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-[#272730] border border-[#E0E1E6] dark:border-[#2E3135] flex-row items-center gap-x-1.5 active:opacity-70"
        >
          <Ionicons
            name="keypad-outline"
            size={15}
            color={isDark ? "#60A5FA" : "#1E40AF"}
          />
          <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
            Jump to #
          </Text>
        </Pressable>

        <Pressable
          onPress={() => nextHymn && navigateToHymn(nextHymn.number)}
          disabled={!nextHymn}
          className={`flex-row items-center py-2 px-3 rounded-xl bg-white dark:bg-[#272730] border border-[#E0E1E6] dark:border-[#2E3135] ${
            !nextHymn ? "opacity-30" : "active:opacity-70"
          }`}
        >
          <Text className="text-xs font-semibold text-[#1E40AF] dark:text-[#60A5FA] mr-1">
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? "#60A5FA" : "#1E40AF"}
          />
        </Pressable>
      </View>

      {/* Jump to Hymn # Modal */}
      <Modal
        visible={jumpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setJumpModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setJumpModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1E1E22] rounded-3xl p-6 border border-[#E0E1E6] dark:border-[#2E3135] shadow-xl"
          >
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] text-center mb-1">
              Go to Hymn Number
            </Text>
            <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] text-center mb-5">
              Enter any hymn number to jump directly
            </Text>

            <TextInput
              keyboardType="number-pad"
              value={jumpNumber}
              onChangeText={setJumpNumber}
              placeholder="e.g. 45"
              placeholderTextColor={isDark ? "#60646C" : "#A0A4AB"}
              autoFocus
              className="bg-[#FAF8F5] dark:bg-[#141416] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl px-4 py-3 text-center text-xl font-bold text-[#1C1917] dark:text-[#F3F4F6] mb-5"
            />

            <View className="flex-row gap-x-3">
              <Pressable
                onPress={() => setJumpModalVisible(false)}
                className="flex-1 py-3 rounded-xl border border-[#E0E1E6] dark:border-[#2E3135] items-center"
              >
                <Text className="text-sm font-semibold text-[#60646C] dark:text-[#B0B4BA]">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleJumpSubmit}
                className="flex-1 py-3 rounded-xl bg-[#1E40AF] dark:bg-[#2563EB] items-center"
              >
                <Text className="text-sm font-semibold text-white">Go</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
