import { useApp } from "@/context/AppContext";
import { Hymn } from "@/db/hymns";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getBaseUrl } from "@/api/client";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function getVersesList(verses: any): string[] {
  if (!verses) return [];
  if (Array.isArray(verses)) return verses;
  if (typeof verses === "string") {
    try {
      const parsed = JSON.parse(verses);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [verses];
    }
  }
  return [];
}

interface StanzaItem {
  id: string;
  type: "stanza" | "chorus";
  number?: number;
  text: string;
}

export default function HymnsScreen() {
  const insets = useSafeAreaInsets();
  const {
    isDark,
    fontSize,
    offlineHymns,
    offlineHymnsYo,
    hymnBookmarks,
    hymnBookmarksYo,
    toggleHymnBookmark,
    syncOfflineHymns,
    isSyncingHymns,
    language,
    t,
  } = useApp();

  const [activeHymnalBook, setActiveHymnalBook] = useState<"english" | "yoruba">("english");
  const [localYorubaHymns, setLocalYorubaHymns] = useState<Hymn[]>(offlineHymnsYo || []);
  const [localEnglishHymns, setLocalEnglishHymns] = useState<Hymn[]>(offlineHymns || []);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  useEffect(() => {
    if (offlineHymns && offlineHymns.length > 0) {
      setLocalEnglishHymns(offlineHymns);
    }
  }, [offlineHymns]);

  useEffect(() => {
    if (offlineHymnsYo && offlineHymnsYo.length > 0) {
      setLocalYorubaHymns(offlineHymnsYo);
    }
  }, [offlineHymnsYo]);

  useEffect(() => {
    AsyncStorage.getItem("activeHymnalBook")
      .then((saved) => {
        if (saved === "english" || saved === "yoruba") {
          setActiveHymnalBook(saved);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem("offlineHymns_yo")
      .then((savedYo) => {
        if (savedYo) {
          try {
            const parsed = JSON.parse(savedYo);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLocalYorubaHymns(parsed);
              return;
            }
          } catch {}
        }
        // Background preload from backend if not yet cached
        const baseUrl = getBaseUrl();
        fetch(`${baseUrl}/hymns/all?book=yoruba`)
          .then((r) => r.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              setLocalYorubaHymns(json.data);
              AsyncStorage.setItem("offlineHymns_yo", JSON.stringify(json.data)).catch(() => {});
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const currentHymns = useMemo(() => {
    return activeHymnalBook === "yoruba" ? localYorubaHymns : localEnglishHymns;
  }, [activeHymnalBook, localEnglishHymns, localYorubaHymns]);

  const handleSwitchBook = (book: "english" | "yoruba") => {
    setActiveHymnalBook(book);
    setSelectedCategory("All");
    setSearchQuery("");
    setKeywordQuery("");
    setOptionsModalVisible(false);
    if (viewMode === "reader") {
      setViewMode("list");
      setSelectedHymn(null);
    }
    AsyncStorage.setItem("activeHymnalBook", book).catch(() => {});

    // Instant local data change with background fetch fallback if cache is empty
    if (book === "yoruba" && localYorubaHymns.length === 0) {
      setIsLoadingBook(true);
      const baseUrl = getBaseUrl();
      fetch(`${baseUrl}/hymns/all?book=yoruba`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setLocalYorubaHymns(json.data);
            AsyncStorage.setItem("offlineHymns_yo", JSON.stringify(json.data)).catch(() => {});
          }
        })
        .catch((err) => console.warn("Could not fetch Yoruba hymns:", err))
        .finally(() => setIsLoadingBook(false));
    } else if (book === "english" && localEnglishHymns.length === 0) {
      setIsLoadingBook(true);
      const baseUrl = getBaseUrl();
      fetch(`${baseUrl}/hymns/all?book=english`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setLocalEnglishHymns(json.data);
            AsyncStorage.setItem("offlineHymns", JSON.stringify(json.data)).catch(() => {});
          }
        })
        .catch((err) => console.warn("Could not fetch English hymns:", err))
        .finally(() => setIsLoadingBook(false));
    }
  };

  const activeHymnBookmarks = useMemo(() => {
    return activeHymnalBook === "yoruba" ? hymnBookmarksYo : hymnBookmarks;
  }, [activeHymnalBook, hymnBookmarksYo, hymnBookmarks]);

  // Mode: 'hymns' | 'search' (matching Bible screen)
  const [activeTab, setActiveTab] = useState<"hymns" | "search">("hymns");

  // Navigation flow: 'list' | 'reader'
  const [viewMode, setViewMode] = useState<"list" | "reader">("list");
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);

  // Dynamic multi-language translation state
  const [translatedHymn, setTranslatedHymn] = useState<Hymn | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    if (!language || language === "en" || !selectedHymn || activeHymnalBook === "yoruba") {
      setTranslatedHymn(null);
      setIsTranslating(false);
      return;
    }

    let isMounted = true;
    setIsTranslating(true);
    const baseUrl = getBaseUrl();
    fetch(`${baseUrl}/hymns/${selectedHymn.number}?lang=${language}`)
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
  }, [selectedHymn?.number, language, activeHymnalBook]);

  const activeHymn = translatedHymn || selectedHymn;

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [keywordQuery, setKeywordQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Jump to # modal
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [jumpNumber, setJumpNumber] = useState("");

  // Options and Category modals
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Continue reading/singing cache
  const [lastVisitedHymnNumber, setLastVisitedHymnNumber] = useState<number>(1);

  // Collect unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentHymns.forEach((h) => {
      if (h.category) set.add(h.category.trim());
    });
    return ["All", ...Array.from(set).sort()];
  }, [currentHymns]);

  // Count hymns per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: currentHymns.length };
    currentHymns.forEach((h) => {
      if (h.category) {
        const cat = h.category.trim();
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [currentHymns]);

  // Filtered Hymns List
  const filteredHymns = useMemo(() => {
    return currentHymns.filter((hymn) => {
      if (showBookmarksOnly && !activeHymnBookmarks.includes(hymn.number)) {
        return false;
      }
      if (selectedCategory !== "All" && hymn.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesNumber = hymn.number.toString().includes(q);
        const matchesTitle = hymn.title?.toLowerCase().includes(q);
        const matchesAuthor = hymn.author?.toLowerCase().includes(q);
        const matchesCategory = hymn.category?.toLowerCase().includes(q);
        return matchesNumber || matchesTitle || matchesAuthor || matchesCategory;
      }
      return true;
    });
  }, [currentHymns, activeHymnBookmarks, showBookmarksOnly, selectedCategory, searchQuery]);

  // Keyword Search across titles, choruses, and verses (matching Bible's keyword search)
  const keywordSearchResults = useMemo(() => {
    if (!keywordQuery.trim()) return [];
    const q = keywordQuery.trim().toLowerCase();
    const results: {
      hymn: Hymn;
      matchedSection: string;
      matchedSnippet: string;
    }[] = [];

    for (const hymn of currentHymns) {
      const verses = getVersesList(hymn.verses);
      let matched = false;

      // Check chorus
      if (hymn.chorus && hymn.chorus.toLowerCase().includes(q)) {
        results.push({
          hymn,
          matchedSection: "Chorus",
          matchedSnippet: hymn.chorus,
        });
        matched = true;
      }

      // Check verses
      if (!matched) {
        for (let i = 0; i < verses.length; i++) {
          const v = verses[i];
          if (v.toLowerCase().includes(q)) {
            results.push({
              hymn,
              matchedSection: `Verse ${i + 1}`,
              matchedSnippet: v,
            });
            break;
          }
        }
      }

      // Check title
      if (!matched && hymn.title.toLowerCase().includes(q)) {
        results.push({
          hymn,
          matchedSection: "Title",
          matchedSnippet: hymn.title,
        });
      }

      if (results.length >= 60) break;
    }

    return results;
  }, [currentHymns, keywordQuery]);

  // Stanza items for the reader FlatList
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

      // Insert chorus after 1st verse if available
      if (idx === 0 && activeHymn.chorus?.trim()) {
        items.push({
          id: "chorus-1",
          type: "chorus",
          text: activeHymn.chorus.trim(),
        });
      }
    });

    // If no verses but has chorus
    if (verses.length === 0 && activeHymn.chorus?.trim()) {
      items.push({
        id: "chorus-standalone",
        type: "chorus",
        text: activeHymn.chorus.trim(),
      });
    }

    return items;
  }, [activeHymn]);

  const handleOpenHymn = (hymn: Hymn) => {
    setSelectedHymn(hymn);
    setLastVisitedHymnNumber(hymn.number);
    setViewMode("reader");
  };

  const handleJumpSubmit = () => {
    const num = parseInt(jumpNumber.trim(), 10);
    if (!isNaN(num) && num > 0) {
      const found = currentHymns.find((h) => h.number === num);
      if (found) {
        setJumpModalVisible(false);
        setJumpNumber("");
        handleOpenHymn(found);
      } else {
        // Fallback to first if not found
        setJumpModalVisible(false);
        setJumpNumber("");
        const closest = currentHymns[0];
        if (closest) handleOpenHymn(closest);
      }
    }
  };

  const navigateHymn = (direction: "next" | "prev") => {
    if (!selectedHymn) return;
    const sorted = [...currentHymns].sort((a, b) => a.number - b.number);
    const currIdx = sorted.findIndex((h) => h.number === selectedHymn.number);

    if (direction === "next" && currIdx < sorted.length - 1) {
      handleOpenHymn(sorted[currIdx + 1]);
    } else if (direction === "prev" && currIdx > 0) {
      handleOpenHymn(sorted[currIdx - 1]);
    }
  };

  const handleShareHymn = async (hymn: Hymn) => {
    try {
      const verses = getVersesList(hymn.verses);
      let content = `HYMN #${hymn.number}: ${hymn.title}\n`;
      if (hymn.author) content += `Author: ${hymn.author}\n`;
      if (hymn.key) content += `Key: ${hymn.key}\n`;
      content += "\n";

      verses.forEach((v, idx) => {
        content += `${idx + 1}.\n${v}\n\n`;
        if (idx === 0 && hymn.chorus) {
          content += `[CHORUS]\n${hymn.chorus}\n\n`;
        }
      });

      content += `\nShared from Fresh Words Hymnal (${activeHymnalBook === "yoruba" ? "Ìwé Orin Mímọ́" : "English Hymnal"})`;
      await Share.share({
        message: content,
        title: `Hymn #${hymn.number} - ${hymn.title}`,
      });
    } catch {}
  };

  // Find last visited hymn
  const lastHymn = useMemo(() => {
    return (
      currentHymns.find((h) => h.number === lastVisitedHymnNumber) ||
      currentHymns[0]
    );
  }, [currentHymns, lastVisitedHymnNumber]);

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header Bar */}
      <View className="px-6 pt-3 pb-3 border-b border-[#E0E1E6] dark:border-[#2E3135] flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3">
          <Pressable
            onPress={() => {
              if (viewMode === "reader") {
                setViewMode("list");
              } else {
                try {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/");
                  }
                } catch {
                  router.replace("/");
                }
              }
            }}
            hitSlop={12}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] items-center justify-center active:opacity-70"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? "#F3F4F6" : "#1C1917"}
            />
          </Pressable>
          <View>
            <Text className="text-xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {viewMode === "reader" && activeHymn
                ? `${t("stanza")} #${activeHymn.number}`
                : activeHymnalBook === "yoruba"
                ? "Ìwé Orin Mímọ́"
                : t("hymnalHeader")}
            </Text>
            <Text className="text-[11px] text-[#60646C] dark:text-[#B0B4BA]">
              {viewMode === "reader" && activeHymn
                ? activeHymn.category || (activeHymnalBook === "yoruba" ? "Yorùbá Hymnal" : t("hymnal"))
                : `${currentHymns.length} ${t("hymnsCountLabel")}`}
            </Text>
          </View>
        </View>

        {/* Right Header Actions */}
        <View className="flex-row items-center gap-x-2">
          {viewMode === "reader" && activeHymn ? (
            <>
              {/* Bookmark Toggle in Reader */}
              <Pressable
                onPress={() => toggleHymnBookmark(activeHymn.number, activeHymnalBook)}
                hitSlop={10}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] items-center justify-center active:opacity-70"
              >
                <Ionicons
                  name={
                    activeHymnBookmarks.includes(activeHymn.number)
                      ? "star"
                      : "star-outline"
                  }
                  size={18}
                  color={
                    activeHymnBookmarks.includes(activeHymn.number)
                      ? "#D97706"
                      : isDark
                      ? "#B0B4BA"
                      : "#60646C"
                  }
                />
              </Pressable>

              {/* Share Hymn in Reader */}
              <Pressable
                onPress={() => handleShareHymn(activeHymn)}
                hitSlop={10}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] items-center justify-center active:opacity-70"
              >
                <Ionicons
                  name="share-outline"
                  size={18}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            </>
          ) : (
            /* Three-dot Options Button (opens bottom slide sheet) */
            <Pressable
              onPress={() => setOptionsModalVisible(true)}
              hitSlop={10}
              className="relative w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] items-center justify-center active:opacity-70"
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              {(showBookmarksOnly || selectedCategory !== "All") && (
                <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* Segment Tabs */}
      {viewMode === "list" && (
        <View className="px-6 pt-1 pb-2">
          <View className="flex-row bg-[#ECE9E2] dark:bg-[#1E1E24] p-1 rounded-2xl">
            <Pressable
              onPress={() => setActiveTab("hymns")}
              className={`flex-1 py-2 rounded-xl items-center justify-center ${
                activeTab === "hymns"
                  ? "bg-white dark:bg-[#2C2C36] shadow-xs"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-xs ${
                  activeTab === "hymns"
                    ? "font-bold text-[#1C1917] dark:text-[#F3F4F6]"
                    : "font-medium text-[#78716C] dark:text-[#9CA3AF]"
                }`}
              >
                {t("hymnal")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("search")}
              className={`flex-1 py-2 rounded-xl items-center justify-center ${
                activeTab === "search"
                  ? "bg-white dark:bg-[#2C2C36] shadow-xs"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-xs ${
                  activeTab === "search"
                    ? "font-bold text-[#1C1917] dark:text-[#F3F4F6]"
                    : "font-medium text-[#78716C] dark:text-[#9CA3AF]"
                }`}
              >
                {t("keywordSearch")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ======================= TAB 1: HYMNS LIST ======================= */}
      {viewMode === "list" && activeTab === "hymns" && (
        <View className="flex-1 px-6 pt-2">
          {/* Search Input Bar */}
          <View className="flex-row items-center gap-x-2 bg-white dark:bg-[#1A1A1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-2xl px-3.5 h-12 mb-3 shadow-xs">
            <Ionicons
              name="search-outline"
              size={18}
              color={isDark ? "#9CA3AF" : "#78716C"}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("searchHymnsPlaceholder")}
              placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
              className="flex-1 h-full py-0 mb-0.5 text-sm text-[#1C1917] dark:text-[#F3F4F6] font-sans"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={isDark ? "#9CA3AF" : "#78716C"}
                />
              </Pressable>
            )}
          </View>

          {/* Controls Row: Category Selector Button & Active Filters */}
          <View className="flex-row items-center justify-between mb-3">
            {/* Category Button */}
            <Pressable
              onPress={() => setCategoryModalVisible(true)}
              className={`flex-row items-center gap-x-2 px-3 py-2 rounded-xl border ${
                selectedCategory !== "All"
                  ? "bg-stone-200/70 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  : "bg-white dark:bg-[#1A1A1E] border-[#E0E1E6] dark:border-[#2E3135]"
              } active:opacity-75`}
            >
              <Ionicons
                name="albums-outline"
                size={14}
                color={isDark ? "#D1D5DB" : "#57534E"}
              />
              <Text
                numberOfLines={1}
                className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6] max-w-[170px]"
              >
                {selectedCategory === "All" ? t("categories") : selectedCategory}
              </Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={isDark ? "#9CA3AF" : "#78716C"}
              />
            </Pressable>

            {/* Filter Indicators / Count */}
            <View className="flex-row items-center gap-x-1.5">
              {selectedCategory !== "All" && (
                <Pressable
                  onPress={() => setSelectedCategory("All")}
                  className="flex-row items-center gap-x-1 px-2 py-1 rounded-lg bg-stone-200/80 dark:bg-stone-800"
                >
                  <Text className="text-[10px] font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    {t("reset")}
                  </Text>
                  <Ionicons name="close" size={11} color={isDark ? "#D6D3D1" : "#44403C"} />
                </Pressable>
              )}
              {showBookmarksOnly && (
                <Pressable
                  onPress={() => setShowBookmarksOnly(false)}
                  className="flex-row items-center gap-x-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30"
                >
                  <Ionicons name="star" size={10} color="#D97706" />
                  <Text className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    {t("starred")}
                  </Text>
                  <Ionicons name="close" size={11} color={isDark ? "#FBBF24" : "#D97706"} />
                </Pressable>
              )}
              <Text className="text-[11px] font-medium text-[#78716C] dark:text-[#9CA3AF] ml-1">
                {filteredHymns.length} hymn{filteredHymns.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>

          {/* Hymns FlatList */}
          <FlatList
            data={filteredHymns}
            keyExtractor={(item) => item.id || `hymn-${item.number}`}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="mt-10 items-center px-6">
                <Ionicons
                  name="musical-notes-outline"
                  size={44}
                  color={isDark ? "#4B5563" : "#D1D5DB"}
                />
                <Text className="text-base font-bold text-[#1C1917] dark:text-[#F3F4F6] mt-3 font-serif text-center">
                  {showBookmarksOnly
                    ? t("noHymnsBookmarksEmpty")
                    : searchQuery.trim()
                    ? `${t("noHymnsFound")} "${searchQuery}"`
                    : activeHymnalBook === "yoruba"
                    ? "Ko si orin Yorùbá lori ẹrọ rẹ sibẹ"
                    : t("noHymnsFoundTitle")}
                </Text>
                <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] text-center mt-1.5 leading-relaxed">
                  {showBookmarksOnly
                    ? "Star any hymn to add it to your favorites."
                    : searchQuery.trim()
                    ? "Try searching with a different word or hymn number."
                    : activeHymnalBook === "yoruba"
                    ? "Tẹ bọtini isalẹ lati gba gbogbo orin Ìwé Orin Mímọ́ wọle."
                    : "No offline hymns are currently loaded. Connect to the internet and tap sync."}
                </Text>
                {!showBookmarksOnly && !searchQuery.trim() && (
                  <Pressable
                    onPress={() => syncOfflineHymns(activeHymnalBook)}
                    disabled={isSyncingHymns}
                    className="mt-4 px-4 py-2.5 rounded-xl bg-[#D97706] flex-row items-center gap-x-2 active:opacity-80"
                  >
                    {isSyncingHymns ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="cloud-download-outline" size={16} color="#FFFFFF" />
                    )}
                    <Text className="text-xs font-bold text-white">
                      {activeHymnalBook === "yoruba"
                        ? "🇳🇬 Sync Yorùbá Hymnal"
                        : "🇬🇧 Sync English Hymnal"}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
            renderItem={({ item }) => {
              const isBookmarked = activeHymnBookmarks.includes(item.number);
              return (
                <Pressable
                  onPress={() => handleOpenHymn(item)}
                  className="flex-row justify-between items-center bg-white dark:bg-[#1A1A1E] border border-[#EAE7E1] dark:border-[#282830] px-4 py-3 rounded-2xl mb-2.5 active:bg-[#F7F5F0] dark:active:bg-[#222228] shadow-2xs"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    {/* Hymn Number Badge */}
                    <View className="min-w-[44px] h-8 px-1.5 rounded-xl bg-[#F0EEEA] dark:bg-[#24242A] border border-[#E5E2DC] dark:border-[#32323A] items-center justify-center mr-3 shrink-0">
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.7}
                        className="text-xs font-bold text-[#44403C] dark:text-[#D6D3D1] text-center"
                      >
                        {item.number}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif"
                      >
                        {item.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-[11px] text-[#78716C] dark:text-[#9CA3AF] mt-0.5"
                      >
                        {[
                          item.category ? item.category.replace(/\bCAC\b/gi, "Mímọ́").replace(/Christ Apostolic Church/gi, "Orin Mímọ́") : "",
                          item.author ? item.author.replace(/Christ Apostolic Church\s*(\(CAC\))?\s*(Worldwide)?/gi, "Ìwé Orin Mímọ́").replace(/\bCAC\b(\s*Worldwide)?/gi, "Ìwé Orin Mímọ́") : "",
                        ].filter(Boolean).join(" • ")}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-x-2">
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleHymnBookmark(item.number, activeHymnalBook);
                      }}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={isBookmarked ? "star" : "star-outline"}
                        size={17}
                        color={isBookmarked ? "#D97706" : isDark ? "#60646C" : "#B0B4BA"}
                      />
                    </Pressable>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? "#4B5563" : "#C4C4CC"} />
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* ======================= TAB 2: KEYWORD SEARCH ======================= */}
      {viewMode === "list" && activeTab === "search" && (
        <View className="flex-1 px-6 pt-2">
          {/* Keyword Search Bar */}
          <View className="flex-row items-center gap-x-2 bg-white dark:bg-[#1A1A1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-2xl px-3.5 h-12 mb-3 shadow-xs">
            <Ionicons
              name="search-outline"
              size={18}
              color={isDark ? "#9CA3AF" : "#78716C"}
            />
            <TextInput
              value={keywordQuery}
              onChangeText={setKeywordQuery}
              placeholder={t("searchLyricsPlaceholder")}
              placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
              className="flex-1 h-full py-0 mb-0.5 text-sm text-[#1C1917] dark:text-[#F3F4F6] font-sans"
              autoCorrect={false}
            />
            {keywordQuery.length > 0 && (
              <Pressable onPress={() => setKeywordQuery("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={isDark ? "#9CA3AF" : "#78716C"}
                />
              </Pressable>
            )}
          </View>

          {/* Search Results FlatList (Mapped with FlatList) */}
          <FlatList
            data={keywordSearchResults}
            keyExtractor={(item, index) =>
              `${item.hymn.number}-${item.matchedSection}-${index}`
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="mt-8 items-center px-4">
                <Text className="text-sm text-[#60646C] dark:text-[#B0B4BA] italic text-center">
                  {keywordQuery.trim()
                    ? `${t("noLyricsFound")} "${keywordQuery}".`
                    : t("lyricsSearchPrompt")}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleOpenHymn(item.hymn)}
                className="border-b border-[#E0E1E6] dark:border-[#2E3135] py-3.5 active:opacity-70"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-bold text-[#1C1917] dark:text-[#F3F4F6]">
                    Hymn #{item.hymn.number}: {item.hymn.title}
                  </Text>
                  <Text className="text-[10px] font-semibold text-[#60646C] dark:text-[#B0B4BA] bg-[#FAF8F5] dark:bg-[#1C1C1E] px-2 py-0.5 rounded-md border border-[#E0E1E6] dark:border-[#2E3135]">
                    {item.matchedSection}
                  </Text>
                </View>
                <Text
                  numberOfLines={2}
                  className="text-sm text-[#1C1917] dark:text-[#F3F4F6] leading-relaxed"
                >
                  {item.matchedSnippet}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* ======================= READER MODE ======================= */}
      {viewMode === "reader" && activeHymn && (
        <View className="flex-1">
          {/* Verses & Stanzas Mapped with FlatList */}
          <FlatList
            data={readerItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 }}
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

                {activeHymnalBook === "yoruba" ? (
                  <View className="flex-row items-center py-1 px-3.5 mb-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 gap-x-1.5">
                    <Ionicons name="book-outline" size={13} color={isDark ? "#34D399" : "#059669"} />
                    <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Ìwé Orin Mímọ́ (Yorùbá)
                    </Text>
                  </View>
                ) : (
                  language === "yo" && !isTranslating && !(activeHymn.is_translated || (translatedHymn && (translatedHymn.title !== selectedHymn?.title || translatedHymn.verses !== selectedHymn?.verses))) && (
                    <View className="flex-row items-center py-2 px-3 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 gap-x-2 w-full">
                      <Ionicons name="information-circle-outline" size={16} color={isDark ? "#FBBF24" : "#D97706"} />
                      <Text className="text-xs text-amber-800 dark:text-amber-200 flex-1 leading-relaxed">
                        {t("officialYorubaPending")}
                      </Text>
                    </View>
                  )
                )}

                {/* Hymn Number & Title */}
                <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] text-center leading-tight mb-2">
                  {activeHymn.title}
                </Text>

                {/* Subtitle Pills */}
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
                <View className="w-16 h-[2px] bg-[#E0E1E6] dark:bg-[#2E3135] rounded-full my-5" />
              </View>
            )}
            renderItem={({ item }) => {
              if (item.type === "chorus") {
                return (
                  <View className="my-4 bg-[#FAF9F6] dark:bg-[#1A1A1E] border-l-4 border-stone-400 dark:border-stone-600 p-4 rounded-r-2xl shadow-2xs">
                    <Text className="text-xs font-bold text-stone-600 dark:text-stone-300 tracking-wider uppercase mb-2">
                      [{t("chorus")}]
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
                  <View className="min-w-[28px] h-7 px-1 rounded-lg bg-[#F0EEEA] dark:bg-[#24242A] border border-[#E5E2DC] dark:border-[#32323A] items-center justify-center mr-3 mt-1 shrink-0">
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                      className="text-xs font-bold text-[#44403C] dark:text-[#D6D3D1] text-center"
                    >
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

          {/* Reader Bottom Navigation Bar (Chapter-style Previous / Jump / Next) */}
          <View className="absolute bottom-0 left-0 right-0 bg-[#FAF8F5] dark:bg-[#1C1C1E] border-t border-[#E0E1E6] dark:border-[#2E3135] px-6 py-3 flex-row items-center justify-between">
            <Pressable
              onPress={() => navigateHymn("prev")}
              className="flex-row items-center py-2 px-3 rounded-xl bg-white dark:bg-[#272730] border border-[#E0E1E6] dark:border-[#2E3135] active:opacity-70"
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6] ml-1">
                {t("previous")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setJumpModalVisible(true)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#272730] border border-[#E0E1E6] dark:border-[#2E3135] flex-row items-center gap-x-1.5 active:opacity-70"
            >
              <Ionicons
                name="keypad-outline"
                size={15}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                {t("jumpToNum")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigateHymn("next")}
              className="flex-row items-center py-2 px-3 rounded-xl bg-white dark:bg-[#272730] border border-[#E0E1E6] dark:border-[#2E3135] active:opacity-70"
            >
              <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6] mr-1">
                {t("next")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Options Bottom Slide Sheet (In-Screen, not a native Modal) */}
      {optionsModalVisible && (
        <View className="absolute inset-0 z-50 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/60"
            onPress={() => setOptionsModalVisible(false)}
          />

          <View className="w-full bg-[#FAF9F5] dark:bg-[#18181C] rounded-t-[32px] px-6 pt-3 pb-8 border-t border-[#E5E2DC] dark:border-[#2A2A32] shadow-2xl z-10">
            {/* Grab / Slide Handle */}
            <View className="w-12 h-1.5 rounded-full bg-[#D1CDCA] dark:bg-[#3E3E48] mx-auto mb-3" />

            {/* Header */}
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-[#EAE7E1] dark:border-[#282830]">
              <View>
                <Text className="text-base font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
                  Hymnal Options
                </Text>
                <Text className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
                  {activeHymnalBook === "yoruba" ? "Ìwé Orin Mímọ́ Yorùbá" : "English Hymnal Collection"}
                </Text>
              </View>
              <Pressable
                onPress={() => setOptionsModalVisible(false)}
                hitSlop={8}
                className="w-7 h-7 rounded-full bg-[#EAE7E1] dark:bg-[#25252C] items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
              </Pressable>
            </View>

            {/* Switch Hymnal Collection Section */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2 px-0.5">
                <Text className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] dark:text-[#9CA3AF]">
                  Switch Hymnal Collection
                </Text>
                {isLoadingBook && (
                  <View className="flex-row items-center gap-x-1">
                    <ActivityIndicator size="small" color="#D97706" />
                    <Text className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Loading...</Text>
                  </View>
                )}
              </View>
              <View className="flex-row gap-x-2.5">
                {/* English Hymnal */}
                <Pressable
                  onPress={() => handleSwitchBook("english")}
                  className={`flex-1 p-3 rounded-2xl border ${
                    activeHymnalBook === "english"
                      ? "bg-[#D97706] border-[#B45309] shadow-sm"
                      : "bg-white dark:bg-[#222228] border-[#E5E2DC] dark:border-[#2A2A32] active:opacity-75"
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Ionicons
                      name="book-outline"
                      size={18}
                      color={activeHymnalBook === "english" ? "#FFFFFF" : isDark ? "#F3F4F6" : "#1C1917"}
                    />
                    {activeHymnalBook === "english" && (
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      activeHymnalBook === "english"
                        ? "text-white"
                        : "text-[#1C1917] dark:text-[#F3F4F6]"
                    }`}
                  >
                    English
                  </Text>
                  <Text
                    className={`text-[11px] ${
                      activeHymnalBook === "english"
                        ? "text-amber-100"
                        : "text-[#78716C] dark:text-[#9CA3AF]"
                    }`}
                  >
                    {localEnglishHymns.length} Hymns
                  </Text>
                </Pressable>

                {/* Yoruba Hymnal */}
                <Pressable
                  onPress={() => handleSwitchBook("yoruba")}
                  className={`flex-1 p-3 rounded-2xl border ${
                    activeHymnalBook === "yoruba"
                      ? "bg-[#D97706] border-[#B45309] shadow-sm"
                      : "bg-white dark:bg-[#222228] border-[#E5E2DC] dark:border-[#2A2A32] active:opacity-75"
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Ionicons
                      name="musical-notes-outline"
                      size={18}
                      color={activeHymnalBook === "yoruba" ? "#FFFFFF" : isDark ? "#F3F4F6" : "#1C1917"}
                    />
                    {activeHymnalBook === "yoruba" && (
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      activeHymnalBook === "yoruba"
                        ? "text-white"
                        : "text-[#1C1917] dark:text-[#F3F4F6]"
                    }`}
                  >
                    Ìwé Orin Mímọ́
                  </Text>
                  <Text
                    className={`text-[11px] ${
                      activeHymnalBook === "yoruba"
                        ? "text-amber-100"
                        : "text-[#78716C] dark:text-[#9CA3AF]"
                    }`}
                  >
                    {localYorubaHymns.length} Orin
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Quick Actions Title */}
            <Text className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] dark:text-[#9CA3AF] mb-2 px-0.5">
              Quick Actions
            </Text>

            {/* Action 1: Go to Hymn # */}
            <Pressable
              onPress={() => {
                setOptionsModalVisible(false);
                setJumpModalVisible(true);
              }}
              className="flex-row items-center p-3 rounded-2xl mb-2 bg-white dark:bg-[#222228] border border-[#E5E2DC] dark:border-[#2A2A32] active:opacity-75"
            >
              <View className="w-9 h-9 rounded-xl bg-stone-200/80 dark:bg-stone-800 items-center justify-center mr-3">
                <Ionicons name="keypad-outline" size={18} color={isDark ? "#F3F4F6" : "#1C1917"} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  {t("jumpToHymn")}
                </Text>
                <Text className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
                  {t("jumpPlaceholder")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />
            </Pressable>

            {/* Action 2: Starred Hymns Toggle */}
            <Pressable
              onPress={() => {
                setShowBookmarksOnly((prev) => !prev);
                setOptionsModalVisible(false);
              }}
              className="flex-row items-center p-3 rounded-2xl mb-2 bg-white dark:bg-[#222228] border border-[#E5E2DC] dark:border-[#2A2A32] active:opacity-75"
            >
              <View className={`w-9 h-9 rounded-xl ${showBookmarksOnly ? "bg-amber-500/20" : "bg-stone-200/80 dark:bg-stone-800"} items-center justify-center mr-3`}>
                <Ionicons
                  name={showBookmarksOnly ? "star" : "star-outline"}
                  size={18}
                  color={showBookmarksOnly ? "#D97706" : isDark ? "#F3F4F6" : "#1C1917"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  {showBookmarksOnly ? t("all") : t("starred")}
                </Text>
                <Text className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
                  {activeHymnBookmarks.length} {t("starred")}
                </Text>
              </View>
              {showBookmarksOnly ? (
                <View className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                  <Text className="text-[10px] font-bold text-amber-700 dark:text-amber-400">ACTIVE</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />
              )}
            </Pressable>

            {/* Action 3: Sync Offline Hymns */}
            <Pressable
              onPress={() => {
                setOptionsModalVisible(false);
                syncOfflineHymns(activeHymnalBook);
              }}
              disabled={isSyncingHymns}
              className="flex-row items-center p-3 rounded-2xl bg-white dark:bg-[#222228] border border-[#E5E2DC] dark:border-[#2A2A32] active:opacity-75"
            >
              <View className="w-9 h-9 rounded-xl bg-stone-200/80 dark:bg-stone-800 items-center justify-center mr-3">
                {isSyncingHymns ? (
                  <ActivityIndicator size="small" color={isDark ? "#F3F4F6" : "#1C1917"} />
                ) : (
                  <Ionicons name="cloud-download-outline" size={18} color={isDark ? "#F3F4F6" : "#1C1917"} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                  {isSyncingHymns ? "Syncing Collection..." : t("syncHymns")}
                </Text>
                <Text className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
                  {currentHymns.length} {activeHymnalBook === "yoruba" ? "Yorùbá hymns" : "English hymns"} cached
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Category Picker In-Screen Overlay */}
      {categoryModalVisible && (
        <View className="absolute inset-0 z-50 justify-end sm:justify-center items-center px-4 pb-6 sm:pb-0">
          <Pressable
            className="absolute inset-0 bg-black/60"
            onPress={() => setCategoryModalVisible(false)}
          />
          <View className="w-full max-w-sm bg-white dark:bg-[#1C1C20] rounded-3xl p-5 border border-[#E5E2DC] dark:border-[#2A2A32] shadow-2xl max-h-[75%] z-10">
            <View className="flex-row items-center justify-between pb-3 mb-2 border-b border-[#EAE7E1] dark:border-[#282830]">
              <View>
                <Text className="text-base font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
                  {t("categories")}
                </Text>
                <Text className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
                  {selectedCategory}
                </Text>
              </View>
              <Pressable
                onPress={() => setCategoryModalVisible(false)}
                hitSlop={8}
                className="w-7 h-7 rounded-full bg-[#F5F4F0] dark:bg-[#25252C] items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
              </Pressable>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              className="my-1"
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item;
                const count = categoryCounts[item] ?? 0;
                return (
                  <Pressable
                    onPress={() => {
                      setSelectedCategory(item);
                      setCategoryModalVisible(false);
                    }}
                    className={`flex-row items-center justify-between py-3 px-3.5 rounded-2xl mb-1.5 ${
                      isSelected
                        ? "bg-stone-200/80 dark:bg-[#2A2A34]"
                        : "bg-transparent active:bg-[#FAF9F6] dark:active:bg-[#222228]"
                    }`}
                  >
                    <View className="flex-row items-center gap-x-2.5">
                      <View
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? "bg-[#1C1917] dark:bg-[#F3F4F6]" : "bg-transparent"
                        }`}
                      />
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? "font-bold text-[#1C1917] dark:text-[#F3F4F6]"
                            : "text-[#44403C] dark:text-[#D1D1D8]"
                        }`}
                      >
                        {item === "All" ? t("all") : item}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-x-2">
                      <Text className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
                        {count}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={isDark ? "#F3F4F6" : "#1C1917"}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      )}

      {/* Jump to Hymn # In-Screen Overlay */}
      {jumpModalVisible && (
        <View className="absolute inset-0 z-50 justify-center items-center px-6">
          <Pressable
            className="absolute inset-0 bg-black/60"
            onPress={() => setJumpModalVisible(false)}
          />
          <View className="w-full max-w-sm bg-white dark:bg-[#1E1E22] rounded-3xl p-6 border border-[#E0E1E6] dark:border-[#2E3135] shadow-xl z-10">
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] text-center mb-1">
              {t("jumpToHymn")}
            </Text>
            <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] text-center mb-5">
              {t("jumpPlaceholder")}
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
                className="flex-1 py-3 rounded-xl border border-[#E0E1E6] dark:border-[#2E3135] items-center active:opacity-75"
              >
                <Text className="text-sm font-semibold text-[#60646C] dark:text-[#B0B4BA]">
                  {t("cancel")}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleJumpSubmit}
                className="flex-1 py-3 rounded-xl bg-[#1C1917] dark:bg-[#F3F4F6] items-center active:opacity-85"
              >
                <Text className="text-sm font-semibold text-white dark:text-[#1C1917]">{t("confirm")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
