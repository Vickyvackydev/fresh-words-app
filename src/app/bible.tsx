import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BibleBook, BibleVerse, MOCK_BIBLE } from "../db/mockDb";
import { useApp } from "@/context/AppContext";

export default function BibleScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, fontSize } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { book: string; chapter: number; verse: number; text: string }[]
  >([]);

  // Navigation state
  const [activeBook, setActiveBook] = useState<BibleBook | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [continueReading, setContinueReading] = useState<{
    book: string;
    chapter: number;
  }>({ book: "Genesis", chapter: 1 });

  // Verse Bottom Sheet state
  const [selectedVerse, setSelectedVerse] = useState<{
    verse: number;
    text: string;
  } | null>(null);
  const [highlightedVerses, setHighlightedVerses] = useState<
    Record<string, string>
  >({}); // verseKey -> color
  const sheetAnim = useRef(new Animated.Value(300)).current; // hidden bottom sheet

  // Local Search function
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    const query = text.toLowerCase();
    const results: typeof searchResults = [];

    MOCK_BIBLE.forEach((book) => {
      book.chapters.forEach((chap) => {
        chap.verses.forEach((v) => {
          if (v.text.toLowerCase().includes(query)) {
            results.push({
              book: book.name,
              chapter: chap.chapter,
              verse: v.verse,
              text: v.text,
            });
          }
        });
      });
    });
    setSearchResults(results.slice(0, 15)); // cap results for clean ui
  };

  const openBookChapter = (book: BibleBook, chapterNum: number) => {
    setActiveBook(book);
    setActiveChapter(chapterNum);
    setContinueReading({ book: book.name, chapter: chapterNum });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleVersePress = (verse: BibleVerse) => {
    setSelectedVerse(verse);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedVerse(null);
    });
  };

  const copyVerse = () => {
    if (selectedVerse && activeBook && activeChapter) {
      const formatted = `"${selectedVerse.text}" — ${activeBook.name} ${activeChapter}:${selectedVerse.verse}`;
      Clipboard.setString(formatted);
      closeBottomSheet();
    }
  };

  const shareVerse = () => {
    if (selectedVerse && activeBook && activeChapter) {
      const formatted = `"${selectedVerse.text}" — ${activeBook.name} ${activeChapter}:${selectedVerse.verse}`;
      Share.share({ message: formatted });
      closeBottomSheet();
    }
  };

  const toggleHighlight = (color: string) => {
    if (selectedVerse && activeBook && activeChapter) {
      const key = `${activeBook.name}-${activeChapter}-${selectedVerse.verse}`;
      setHighlightedVerses((prev) => {
        const updated = { ...prev };
        if (updated[key] === color) {
          delete updated[key];
        } else {
          updated[key] = color;
        }
        return updated;
      });
      closeBottomSheet();
    }
  };

  // Chapter slider navigation
  const navigateChapter = (direction: "next" | "prev") => {
    if (!activeBook || activeChapter === null) return;
    const currentIdx = activeBook.chapters.findIndex(
      (c) => c.chapter === activeChapter,
    );

    if (direction === "next" && currentIdx < activeBook.chapters.length - 1) {
      setActiveChapter(activeBook.chapters[currentIdx + 1].chapter);
    } else if (direction === "prev" && currentIdx > 0) {
      setActiveChapter(activeBook.chapters[currentIdx - 1].chapter);
    }
  };

  const currentBookChapters = activeBook?.chapters.find(
    (c) => c.chapter === activeChapter,
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      {/* 1. Main Directory View (when no book is open) */}
      {!activeBook && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 80,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text className="text-2xl font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6] mb-6">
            Holy Bible
          </Text>

          {/* Search bar */}
          <View className="flex-row items-center gap-x-2 bg-[#FAF8F5] dark:bg-[#1E1E1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl px-3 h-12 mb-6">
            <Ionicons
              name="search-outline"
              size={20}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search scripture..."
              placeholderTextColor={isDark ? "#B0B4BA" : "#60646C"}
              className="flex-1 text-sm text-[#1C1917] dark:text-[#F3F4F6] font-sans mb-1"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => handleSearch("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            )}
          </View>

          {/* Search Results Drawer */}
          {searchQuery.length > 0 && (
            <View className="mb-6 bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-2xl p-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
                Search Results ({searchResults.length})
              </Text>
              {searchResults.length === 0 ? (
                <Text className="text-sm text-[#60646C] dark:text-[#B0B4BA] italic">
                  No verses match your query.
                </Text>
              ) : (
                searchResults.map((res, i) => (
                  <Pressable
                    key={i}
                    onPress={() => {
                      const book = MOCK_BIBLE.find((b) => b.name === res.book);
                      if (book) openBookChapter(book, res.chapter);
                    }}
                    className="border-b border-[#E0E1E6] dark:border-[#2E3135] py-3 last:border-b-0 active:opacity-75"
                  >
                    <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA] mb-1">
                      {res.book} {res.chapter}:{res.verse}
                    </Text>
                    <Text
                      className="text-sm text-[#1C1917] dark:text-[#F3F4F6]"
                      numberOfLines={2}
                    >
                      {res.text}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Pinned / Continue Reading */}
          <View className="mb-8">
            <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
              Continue Reading
            </Text>
            <Pressable
              onPress={() => {
                const book =
                  MOCK_BIBLE.find((b) => b.name === continueReading.book) ||
                  MOCK_BIBLE[0];
                openBookChapter(book, continueReading.chapter);
              }}
              className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] p-5 rounded-2xl flex-row justify-between items-center active:opacity-95"
            >
              <View>
                <Text className="text-lg font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                  {continueReading.book} {continueReading.chapter}
                </Text>
                <Text className="text-xs text-[#60646C] dark:text-[#B0B4BA] mt-1">
                  Last viewed scripture chapter
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
            </Pressable>
          </View>

          {/* Book Lists split by testaments */}
          {/* Old Testament */}
          <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
            Old Testament
          </Text>
          <View className="gap-y-3 mb-6">
            {MOCK_BIBLE.filter((b) => b.testament === "Old").map((book) => (
              <View
                key={book.name}
                className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-2xl p-4"
              >
                <Text className="text-base font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif mb-2">
                  {book.name}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {book.chapters.map((c) => (
                    <Pressable
                      key={c.chapter}
                      onPress={() => openBookChapter(book, c.chapter)}
                      className="w-10 h-10 bg-[#FAF8F5] dark:bg-[#2E3135] items-center justify-center rounded-xl border border-[#E0E1E6] dark:border-[#3E4249] active:opacity-60"
                    >
                      <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                        {c.chapter}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* New Testament */}
          <Text className="text-xs font-bold tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-3">
            New Testament
          </Text>
          <View className="gap-y-3">
            {MOCK_BIBLE.filter((b) => b.testament === "New").map((book) => (
              <View
                key={book.name}
                className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-2xl p-4"
              >
                <Text className="text-base font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif mb-2">
                  {book.name}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {book.chapters.map((c) => (
                    <Pressable
                      key={c.chapter}
                      onPress={() => openBookChapter(book, c.chapter)}
                      className="w-10 h-10 bg-[#FAF8F5] dark:bg-[#2E3135] items-center justify-center rounded-xl border border-[#E0E1E6] dark:border-[#3E4249] active:opacity-60"
                    >
                      <Text className="text-xs font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                        {c.chapter}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 2. Scripture Reader Panel */}
      {activeBook && activeChapter !== null && currentBookChapters && (
        <View className="flex-1" style={{ paddingTop: insets.top }}>
          {/* Header Bar */}
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-[#E0E1E6] dark:border-[#2E3135]">
            <Pressable
              onPress={() => {
                setActiveBook(null);
                setActiveChapter(null);
              }}
              hitSlop={15}
              className="flex-row items-center active:opacity-60"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                className="text-[#1C1917] dark:text-[#F3F4F6]"
              />
              <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6] ml-2">
                Library
              </Text>
            </Pressable>
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {activeBook.name} {activeChapter}
            </Text>
            <View className="w-10" /> {/* balance layout */}
          </View>

          {/* Verses Scroll View */}
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingVertical: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-y-6">
              {currentBookChapters.verses.map((v) => {
                const key = `${activeBook.name}-${activeChapter}-${v.verse}`;
                const highlightColor = highlightedVerses[key];
                return (
                  <Pressable
                    key={v.verse}
                    onPress={() => handleVersePress(v)}
                    className={`py-2 px-1 rounded-xl active:bg-[#F3EFE6] dark:active:bg-[#1E1E1E]`}
                    style={{ backgroundColor: highlightColor || undefined }}
                  >
                    <Text
                      className="text-[#1C1917] dark:text-[#F3F4F6] leading-[1.7] font-sans"
                      style={{ fontSize: fontSize }}
                    >
                      <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA] mr-2">
                        {v.verse}
                      </Text>{" "}
                      {v.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Bottom Slider Nav */}
            <View className="flex-row justify-between items-center border-t border-[#E0E1E6] dark:border-[#2E3135] pt-8 mt-10">
              <Pressable
                onPress={() => navigateChapter("prev")}
                className="flex-row items-center py-2 active:opacity-60"
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  className="text-[#1E40AF] dark:text-[#60A5FA]"
                />
                <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] ml-1">
                  Prev Chapter
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigateChapter("next")}
                className="flex-row items-center py-2 active:opacity-60"
              >
                <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] mr-1">
                  Next Chapter
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  className="text-[#1E40AF] dark:text-[#60A5FA]"
                />
              </Pressable>
            </View>
          </ScrollView>

          {/* 3. Verse Selection Custom Bottom Sheet */}
          {selectedVerse && (
            <Pressable
              className="absolute inset-0 bg-black/20"
              onPress={closeBottomSheet}
            >
              <Animated.View
                className="absolute bottom-0 left-0 right-0 bg-[#FAF8F5] dark:bg-[#1C1C1E] rounded-t-3xl border-t border-[#E0E1E6] dark:border-[#2E3135] p-6 space-y-4"
                style={{
                  transform: [{ translateY: sheetAnim }],
                  paddingBottom: insets.bottom + 16,
                }}
              >
                {/* Drag handle indicator */}
                <View className="items-center mb-1">
                  <View className="w-12 h-1 bg-[#E0E1E6] dark:bg-[#2E3135] rounded-full" />
                </View>

                {/* Verse summary */}
                <View className="mb-2">
                  <Text className="text-xs font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-1">
                    Selected Verse • {activeBook.name} {activeChapter}:
                    {selectedVerse.verse}
                  </Text>
                  <Text
                    className="text-sm italic text-[#1C1917] dark:text-[#F3F4F6] font-serif"
                    numberOfLines={1}
                  >
                    "{selectedVerse.text}"
                  </Text>
                </View>

                {/* Highlight Colors Row */}
                <View className="flex-row items-center justify-between border-b border-[#E0E1E6] dark:border-[#2E3135] pb-4">
                  <Text className="text-xs font-bold text-[#60646C] dark:text-[#B0B4BA]">
                    Highlight Color
                  </Text>
                  <View className="flex-row space-x-3">
                    {["#FEF3C7", "#DCFCE7", "#DBEAFE", "#FCE7F3"].map(
                      (color) => (
                        <Pressable
                          key={color}
                          onPress={() => toggleHighlight(color)}
                          style={{ backgroundColor: color }}
                          className="w-8 h-8 rounded-full border border-black/10 active:scale-90"
                        />
                      ),
                    )}
                    <Pressable
                      onPress={() => toggleHighlight("")}
                      className="w-8 h-8 rounded-full bg-transparent border border-[#60646C] dark:border-[#B0B4BA] items-center justify-center active:scale-90"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        className="text-[#60646C] dark:text-[#B0B4BA]"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Action Items List */}
                <View className="flex-row justify-between space-x-2">
                  <Pressable
                    onPress={copyVerse}
                    className="flex-1 flex-row items-center justify-center bg-[#FAF8F5] dark:bg-[#2E3135] border border-[#E0E1E6] dark:border-[#3E4249] h-12 rounded-xl active:bg-[#F3EFE6]"
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      className="text-[#1C1917] dark:text-[#F3F4F6] mr-2"
                    />
                    <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6]">
                      Copy
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={shareVerse}
                    className="flex-1 flex-row items-center justify-center bg-[#1E40AF] dark:bg-[#2563EB] h-12 rounded-xl active:opacity-90"
                  >
                    <Ionicons
                      name="share-outline"
                      size={18}
                      color="white"
                      className="mr-2"
                    />
                    <Text className="text-sm font-semibold text-white">
                      Share
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
