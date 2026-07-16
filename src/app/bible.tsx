import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  FlatList,
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
import BIBLE_RAW_DATA from "../db/bible-kjv.json";
import { BibleBook, BibleVerse } from "../db/mockDb";

const BIBLE_BOOKS = [
  { abbrev: "gn", name: "Genesis", testament: "Old" as const },
  { abbrev: "ex", name: "Exodus", testament: "Old" as const },
  { abbrev: "lv", name: "Leviticus", testament: "Old" as const },
  { abbrev: "nm", name: "Numbers", testament: "Old" as const },
  { abbrev: "dt", name: "Deuteronomy", testament: "Old" as const },
  { abbrev: "js", name: "Joshua", testament: "Old" as const },
  { abbrev: "jg", name: "Judges", testament: "Old" as const },
  { abbrev: "rt", name: "Ruth", testament: "Old" as const },
  { abbrev: "1s", name: "1 Samuel", testament: "Old" as const },
  { abbrev: "2s", name: "2 Samuel", testament: "Old" as const },
  { abbrev: "1k", name: "1 Kings", testament: "Old" as const },
  { abbrev: "2k", name: "2 Kings", testament: "Old" as const },
  { abbrev: "1ch", name: "1 Chronicles", testament: "Old" as const },
  { abbrev: "2ch", name: "2 Chronicles", testament: "Old" as const },
  { abbrev: "ez", name: "Ezra", testament: "Old" as const },
  { abbrev: "ne", name: "Nehemiah", testament: "Old" as const },
  { abbrev: "es", name: "Esther", testament: "Old" as const },
  { abbrev: "jb", name: "Job", testament: "Old" as const },
  { abbrev: "ps", name: "Psalms", testament: "Old" as const },
  { abbrev: "pr", name: "Proverbs", testament: "Old" as const },
  { abbrev: "ec", name: "Ecclesiastes", testament: "Old" as const },
  { abbrev: "sn", name: "Song of Solomon", testament: "Old" as const },
  { abbrev: "is", name: "Isaiah", testament: "Old" as const },
  { abbrev: "jr", name: "Jeremiah", testament: "Old" as const },
  { abbrev: "lm", name: "Lamentations", testament: "Old" as const },
  { abbrev: "ek", name: "Ezekiel", testament: "Old" as const },
  { abbrev: "dn", name: "Daniel", testament: "Old" as const },
  { abbrev: "hs", name: "Hosea", testament: "Old" as const },
  { abbrev: "jl", name: "Joel", testament: "Old" as const },
  { abbrev: "am", name: "Amos", testament: "Old" as const },
  { abbrev: "ob", name: "Obadiah", testament: "Old" as const },
  { abbrev: "jn", name: "Jonah", testament: "Old" as const },
  { abbrev: "mi", name: "Micah", testament: "Old" as const },
  { abbrev: "na", name: "Nahum", testament: "Old" as const },
  { abbrev: "hk", name: "Habakkuk", testament: "Old" as const },
  { abbrev: "zp", name: "Zephaniah", testament: "Old" as const },
  { abbrev: "hg", name: "Haggai", testament: "Old" as const },
  { abbrev: "zc", name: "Zechariah", testament: "Old" as const },
  { abbrev: "ml", name: "Malachi", testament: "Old" as const },
  { abbrev: "mt", name: "Matthew", testament: "New" as const },
  { abbrev: "mk", name: "Mark", testament: "New" as const },
  { abbrev: "lk", name: "Luke", testament: "New" as const },
  { abbrev: "jo", name: "John", testament: "New" as const },
  { abbrev: "ac", name: "Acts", testament: "New" as const },
  { abbrev: "rm", name: "Romans", testament: "New" as const },
  { abbrev: "1co", name: "1 Corinthians", testament: "New" as const },
  { abbrev: "2co", name: "2 Corinthians", testament: "New" as const },
  { abbrev: "gl", name: "Galatians", testament: "New" as const },
  { abbrev: "ep", name: "Ephesians", testament: "New" as const },
  { abbrev: "ph", name: "Philippians", testament: "New" as const },
  { abbrev: "cl", name: "Colossians", testament: "New" as const },
  { abbrev: "1th", name: "1 Thessalonians", testament: "New" as const },
  { abbrev: "2th", name: "2 Thessalonians", testament: "New" as const },
  { abbrev: "1ti", name: "1 Timothy", testament: "New" as const },
  { abbrev: "2ti", name: "2 Timothy", testament: "New" as const },
  { abbrev: "tt", name: "Titus", testament: "New" as const },
  { abbrev: "phm", name: "Philemon", testament: "New" as const },
  { abbrev: "hb", name: "Hebrews", testament: "New" as const },
  { abbrev: "jm", name: "James", testament: "New" as const },
  { abbrev: "1pe", name: "1 Peter", testament: "New" as const },
  { abbrev: "2pe", name: "2 Peter", testament: "New" as const },
  { abbrev: "1jo", name: "1 John", testament: "New" as const },
  { abbrev: "2jo", name: "2 John", testament: "New" as const },
  { abbrev: "3jo", name: "3 John", testament: "New" as const },
  { abbrev: "jd", name: "Jude", testament: "New" as const },
  { abbrev: "rv", name: "Revelation", testament: "New" as const },
];

export const FULL_BIBLE: BibleBook[] = (BIBLE_RAW_DATA as any).map(
  (book: any, bookIdx: number) => {
    const meta = BIBLE_BOOKS[bookIdx] || {
      abbrev: book.abbrev,
      name: book.abbrev,
      testament: "Old" as const,
    };
    return {
      name: meta.name,
      testament: meta.testament,
      chapters: book.chapters.map((chap: string[], chapIdx: number) => ({
        chapter: chapIdx + 1,
        verses: chap.map((vStr: string, vIdx: number) => ({
          verse: vIdx + 1,
          text: vStr.replace(/\{|\}/g, ""),
        })),
      })),
    };
  },
);

export default function BibleScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, fontSize } = useApp();

  // Mode state: 'books' | 'search'
  const [activeTab, setActiveTab] = useState<"books" | "search">("books");

  // Navigation flow state: 'books' | 'chapters' | 'verses' | 'reader'
  const [viewMode, setViewMode] = useState<
    "books" | "chapters" | "verses" | "reader"
  >("books");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);

  // Search states
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [keywordSearchQuery, setKeywordSearchQuery] = useState("");
  const [keywordSearchResults, setKeywordSearchResults] = useState<
    { book: string; chapter: number; verse: number; text: string }[]
  >([]);

  // Continue Reading cache
  const [continueReading, setContinueReading] = useState<{
    book: string;
    chapter: number;
  }>({ book: "Genesis", chapter: 1 });

  // Scroll layouts refs
  const verseLayouts = useRef<Record<number, number>>({});
  const readerScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    verseLayouts.current = {};
  }, [selectedChapter, selectedBook]);

  useEffect(() => {
    if (viewMode === "reader" && selectedVerseNum !== null) {
      const timer = setTimeout(() => {
        const yOffset = verseLayouts.current[selectedVerseNum];
        if (typeof yOffset === "number" && readerScrollViewRef.current) {
          readerScrollViewRef.current.scrollTo({
            y: Math.max(0, yOffset - 40),
            animated: true,
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [viewMode, selectedVerseNum, selectedChapter]);

  // Verse Bottom Sheet state
  const [selectedVerse, setSelectedVerse] = useState<{
    verse: number;
    text: string;
  } | null>(null);
  const [highlightedVerses, setHighlightedVerses] = useState<
    Record<string, string>
  >({}); // verseKey -> color
  const sheetAnim = useRef(new Animated.Value(300)).current;

  // Local text search
  const handleKeywordSearch = (text: string) => {
    setKeywordSearchQuery(text);
    if (!text.trim()) {
      setKeywordSearchResults([]);
      return;
    }
    const query = text.toLowerCase();
    const results: typeof keywordSearchResults = [];

    for (let bIdx = 0; bIdx < FULL_BIBLE.length; bIdx++) {
      const book = FULL_BIBLE[bIdx];
      for (let cIdx = 0; cIdx < book.chapters.length; cIdx++) {
        const chap = book.chapters[cIdx];
        for (let vIdx = 0; vIdx < chap.verses.length; vIdx++) {
          const v = chap.verses[vIdx];
          if (v.text.toLowerCase().includes(query)) {
            results.push({
              book: book.name,
              chapter: chap.chapter,
              verse: v.verse,
              text: v.text,
            });
            if (results.length >= 80) break; // cap search results for performance
          }
        }
        if (results.length >= 80) break;
      }
      if (results.length >= 80) break;
    }
    setKeywordSearchResults(results);
  };

  const selectSearchResult = (
    bookName: string,
    chapterNum: number,
    verseNum: number,
  ) => {
    const book = FULL_BIBLE.find((b) => b.name === bookName);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(chapterNum);
      setSelectedVerseNum(verseNum);
      setContinueReading({ book: bookName, chapter: chapterNum });
      setViewMode("reader");
    }
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
    if (selectedVerse && selectedBook && selectedChapter) {
      const formatted = `"${selectedVerse.text}" — ${selectedBook.name} ${selectedChapter}:${selectedVerse.verse}`;
      Clipboard.setString(formatted);
      closeBottomSheet();
    }
  };

  const shareVerse = () => {
    if (selectedVerse && selectedBook && selectedChapter) {
      const formatted = `"${selectedVerse.text}" — ${selectedBook.name} ${selectedChapter}:${selectedVerse.verse}`;
      Share.share({ message: formatted });
      closeBottomSheet();
    }
  };

  const toggleHighlight = (color: string) => {
    if (selectedVerse && selectedBook && selectedChapter) {
      const key = `${selectedBook.name}-${selectedChapter}-${selectedVerse.verse}`;
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

  const navigateChapter = (direction: "next" | "prev") => {
    if (!selectedBook || selectedChapter === null) return;
    const currentIdx = selectedBook.chapters.findIndex(
      (c) => c.chapter === selectedChapter,
    );

    if (direction === "next") {
      if (currentIdx < selectedBook.chapters.length - 1) {
        setSelectedChapter(selectedBook.chapters[currentIdx + 1].chapter);
        setSelectedVerseNum(null);
      } else {
        const bookIdx = FULL_BIBLE.findIndex(
          (b) => b.name === selectedBook.name,
        );
        if (bookIdx < FULL_BIBLE.length - 1) {
          const nextBook = FULL_BIBLE[bookIdx + 1];
          setSelectedBook(nextBook);
          setSelectedChapter(1);
          setSelectedVerseNum(null);
          setContinueReading({ book: nextBook.name, chapter: 1 });
        }
      }
    } else if (direction === "prev") {
      if (currentIdx > 0) {
        setSelectedChapter(selectedBook.chapters[currentIdx - 1].chapter);
        setSelectedVerseNum(null);
      } else {
        const bookIdx = FULL_BIBLE.findIndex(
          (b) => b.name === selectedBook.name,
        );
        if (bookIdx > 0) {
          const prevBook = FULL_BIBLE[bookIdx - 1];
          const lastChapter =
            prevBook.chapters[prevBook.chapters.length - 1].chapter;
          setSelectedBook(prevBook);
          setSelectedChapter(lastChapter);
          setSelectedVerseNum(null);
          setContinueReading({ book: prevBook.name, chapter: lastChapter });
        }
      }
    }
  };

  const currentBookChapters = selectedBook?.chapters.find(
    (c) => c.chapter === selectedChapter,
  );

  // Filter book list
  const filteredBooks = FULL_BIBLE.filter((b) =>
    b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-[#FDFBF7] dark:bg-[#121212]"
    >
      {/* Tab Segment Controls */}
      {viewMode !== "reader" && (
        <View className="px-6 pt-4 pb-2 flex-row gap-x-2">
          <Pressable
            onPress={() => setActiveTab("books")}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === "books"
                ? "bg-[#1E40AF] dark:bg-[#2563EB]"
                : "bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135]"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                activeTab === "books"
                  ? "text-white"
                  : "text-[#60646C] dark:text-[#B0B4BA]"
              }`}
            >
              Books
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("search")}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === "search"
                ? "bg-[#1E40AF] dark:bg-[#2563EB]"
                : "bg-[#FAF8F5] dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135]"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                activeTab === "search"
                  ? "text-white"
                  : "text-[#60646C] dark:text-[#B0B4BA]"
              }`}
            >
              Keyword Search
            </Text>
          </Pressable>
        </View>
      )}

      {/* Mode A: Keyword Search Tab */}
      {activeTab === "search" && viewMode !== "reader" && (
        <View className="flex-1 px-6 pt-3">
          <View className="flex-row items-center gap-x-2 bg-[#FAF8F5] dark:bg-[#1E1E1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl px-3 h-12 mb-4">
            <Ionicons
              name="search-outline"
              size={18}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
            <TextInput
              value={keywordSearchQuery}
              onChangeText={handleKeywordSearch}
              placeholder="Search keyword in all scriptures..."
              placeholderTextColor={isDark ? "#B0B4BA" : "#60646C"}
              className="flex-1 h-full py-0 mb-2 text-sm text-[#1C1917] dark:text-[#F3F4F6] font-sans"
              autoCorrect={false}
            />
            {keywordSearchQuery.length > 0 && (
              <Pressable onPress={() => handleKeywordSearch("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            )}
          </View>

          <FlatList
            data={keywordSearchResults}
            keyExtractor={(item, index) =>
              `${item.book}-${item.chapter}-${item.verse}-${index}`
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="mt-8 items-center">
                <Text className="text-sm text-[#60646C] dark:text-[#B0B4BA] italic text-center">
                  {keywordSearchQuery.trim()
                    ? "No verses found matching your query."
                    : "Type a keyword (e.g. 'grace') to search the entire Bible."}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  selectSearchResult(item.book, item.chapter, item.verse)
                }
                className="border-b border-[#E0E1E6] dark:border-[#2E3135] py-3.5 active:opacity-70"
              >
                <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA] mb-1">
                  {item.book} {item.chapter}:{item.verse}
                </Text>
                <Text className="text-sm text-[#1C1917] dark:text-[#F3F4F6] leading-relaxed">
                  {item.text}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Mode B: Books Hierarchical Flow */}
      {activeTab === "books" && viewMode === "books" && (
        <View className="flex-1 px-6 pt-3">
          {/* Continue Reading Shortcut */}
          <Pressable
            onPress={() => {
              const book =
                FULL_BIBLE.find((b) => b.name === continueReading.book) ||
                FULL_BIBLE[0];
              setSelectedBook(book);
              setSelectedChapter(continueReading.chapter);
              setSelectedVerseNum(null);
              setViewMode("reader");
            }}
            className="bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] p-4 rounded-2xl flex-row justify-between items-center mb-4 active:opacity-85 shadow-sm"
          >
            <View>
              <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                Continue Reading: {continueReading.book}{" "}
                {continueReading.chapter}
              </Text>
              <Text className="text-[11px] text-[#60646C] dark:text-[#B0B4BA] mt-0.5">
                Resume from your last visited chapter
              </Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={isDark ? "#60A5FA" : "#1E40AF"}
            />
          </Pressable>

          {/* Book Search Bar */}
          <View className="flex-row items-center gap-x-2 bg-[#FAF8F5] dark:bg-[#1E1E1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl px-3 h-12 mb-4">
            <Ionicons
              name="search-outline"
              size={18}
              color={isDark ? "#B0B4BA" : "#60646C"}
            />
            <TextInput
              value={bookSearchQuery}
              onChangeText={setBookSearchQuery}
              placeholder="Search book name..."
              placeholderTextColor={isDark ? "#B0B4BA" : "#60646C"}
              className="flex-1 h-full py-0 mb-2 text-sm text-[#1C1917] dark:text-[#F3F4F6] font-sans"
              autoCorrect={false}
            />
            {bookSearchQuery.length > 0 && (
              <Pressable onPress={() => setBookSearchQuery("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={isDark ? "#B0B4BA" : "#60646C"}
                />
              </Pressable>
            )}
          </View>

          {/* Books FlatList */}
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.name}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedBook(item);
                  setViewMode("chapters");
                }}
                className="flex-row justify-between items-center bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] px-4 py-3 rounded-xl mb-2.5 active:bg-[#F3EFE6] dark:active:bg-[#252525]"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-[#EEF2FF] dark:bg-[#1A1F36] items-center justify-center mr-3">
                    <Text className="text-[10px] font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                      {item.testament === "Old" ? "OT" : "NT"}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                    {item.name}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-[11px] text-[#60646C] dark:text-[#B0B4BA] mr-2">
                    {item.chapters.length} Chapters
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#B0B4BA" />
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Chapters Grid View */}
      {viewMode === "chapters" && selectedBook && (
        <View className="flex-1 px-6 pt-3">
          {/* Sub Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-[#E0E1E6] dark:border-[#2E3135] mb-4">
            <Pressable
              onPress={() => {
                setSelectedBook(null);
                setViewMode("books");
              }}
              className="flex-row items-center py-1 active:opacity-60"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
              <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] ml-1">
                Books
              </Text>
            </Pressable>
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {selectedBook.name}
            </Text>
            <View className="w-12" />
          </View>

          <FlatList
            data={selectedBook.chapters}
            keyExtractor={(item) => `${selectedBook.name}-ch-${item.chapter}`}
            numColumns={5}
            contentContainerStyle={{ paddingBottom: 100 }}
            columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedChapter(item.chapter);
                  setViewMode("verses");
                }}
                className="flex-1 aspect-square bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl items-center justify-center active:bg-[#F3EFE6] dark:active:bg-[#252525]"
              >
                <Text className="text-sm font-bold text-[#1C1917] dark:text-[#F3F4F6]">
                  {item.chapter}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Verses Grid View */}
      {viewMode === "verses" && selectedBook && selectedChapter !== null && (
        <View className="flex-1 px-6 pt-3">
          {/* Sub Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-[#E0E1E6] dark:border-[#2E3135] mb-4">
            <Pressable
              onPress={() => {
                setSelectedChapter(null);
                setViewMode("chapters");
              }}
              className="flex-row items-center py-1 active:opacity-60"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDark ? "#60A5FA" : "#1E40AF"}
              />
              <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] ml-1">
                Chapters
              </Text>
            </Pressable>
            <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
              {selectedBook.name} {selectedChapter}
            </Text>
            <View className="w-12" />
          </View>

          <FlatList
            data={
              selectedBook.chapters.find((c) => c.chapter === selectedChapter)
                ?.verses || []
            }
            keyExtractor={(item) =>
              `${selectedBook.name}-ch-${selectedChapter}-v-${item.verse}`
            }
            numColumns={5}
            contentContainerStyle={{ paddingBottom: 100 }}
            columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedVerseNum(item.verse);
                  setContinueReading({
                    book: selectedBook.name,
                    chapter: selectedChapter,
                  });
                  setViewMode("reader");
                }}
                className="flex-1 aspect-square bg-white dark:bg-[#1C1C1E] border border-[#E0E1E6] dark:border-[#2E3135] rounded-xl items-center justify-center active:bg-[#F3EFE6] dark:active:bg-[#252525]"
              >
                <Text className="text-xs font-bold text-[#60646C] dark:text-[#B0B4BA]">
                  {item.verse}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Reader Panel View */}
      {viewMode === "reader" &&
        selectedBook &&
        selectedChapter !== null &&
        currentBookChapters && (
          <View className="flex-1">
            {/* Header Bar */}
            <View className="flex-row items-center justify-between px-6 py-3 border-b border-[#E0E1E6] dark:border-[#2E3135]">
              <Pressable
                onPress={() => {
                  setViewMode("verses");
                }}
                hitSlop={15}
                className="flex-row items-center active:opacity-60"
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={isDark ? "#F3F4F6" : "#1C1917"}
                />
                <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6] ml-1.5">
                  Verses
                </Text>
              </Pressable>
              <Text className="text-lg font-bold font-serif text-[#1C1917] dark:text-[#F3F4F6]">
                {selectedBook.name} {selectedChapter}
              </Text>
              <Pressable
                onPress={() => {
                  setSelectedBook(null);
                  setSelectedChapter(null);
                  setSelectedVerseNum(null);
                  setViewMode("books");
                }}
                className="active:opacity-60"
              >
                <Text className="text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA]">
                  Library
                </Text>
              </Pressable>
            </View>

            <ScrollView
              ref={readerScrollViewRef}
              className="flex-1 px-6"
              contentContainerStyle={{
                paddingVertical: 24,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-y-6">
                {currentBookChapters.verses.map((v) => {
                  const key = `${selectedBook.name}-${selectedChapter}-${v.verse}`;
                  const highlightColor = highlightedVerses[key];
                  const isTarget = selectedVerseNum === v.verse;
                  return (
                    <Pressable
                      key={v.verse}
                      onLayout={(event) => {
                        verseLayouts.current[v.verse] =
                          event.nativeEvent.layout.y;
                      }}
                      onPress={() => handleVersePress(v)}
                      className="py-2 px-2.5 rounded-xl active:bg-[#F3EFE6] dark:active:bg-[#1E1E1E]"
                      style={{
                        backgroundColor:
                          highlightColor ||
                          (isTarget
                            ? isDark
                              ? "#1E293B"
                              : "#EFF6FF"
                            : undefined),
                        borderWidth: isTarget ? 1 : 0,
                        borderColor: isDark ? "#3B82F6" : "#60A5FA",
                      }}
                    >
                      <Text
                        className="text-[#1C1917] dark:text-[#F3F4F6] leading-[1.7] font-sans"
                        style={{ fontSize: fontSize }}
                      >
                        <Text className="text-xs font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                          {v.verse}
                          {"   "}
                        </Text>
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
                    color={isDark ? "#60A5FA" : "#1E40AF"}
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
                    color={isDark ? "#60A5FA" : "#1E40AF"}
                  />
                </Pressable>
              </View>
            </ScrollView>

            {/* Verse Selection Custom Bottom Sheet */}
            {selectedVerse && (
              <Pressable
                className="absolute inset-0 bg-black/20"
                onPress={closeBottomSheet}
              >
                <Animated.View
                  className="absolute bottom-0 left-0 right-0 bg-[#FAF8F5] dark:bg-[#1C1C1E] rounded-t-3xl border-t border-[#E0E1E6] dark:border-[#2E3135] p-6 gap-y-4"
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
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-[#60646C] dark:text-[#B0B4BA] mb-1">
                      Selected Verse • {selectedBook.name} {selectedChapter}:
                      {selectedVerse.verse}
                    </Text>
                    <Text className="text-sm italic text-[#1C1917] dark:text-[#F3F4F6] font-serif">
                      "{selectedVerse.text}"
                    </Text>
                  </View>

                  {/* Highlight Colors Row */}
                  <View className="flex-row items-center justify-between border-b border-[#E0E1E6] dark:border-[#2E3135] pb-4">
                    <Text className="text-xs font-bold text-[#60646C] dark:text-[#B0B4BA]">
                      Highlight Color
                    </Text>
                    <View className="flex-row gap-x-2">
                      {["#FEF3C7", "#DCFCE7", "#DBEAFE", "#FCE7F3"].map(
                        (color) => (
                          <Pressable
                            key={color}
                            onPress={() => toggleHighlight(color)}
                            style={{ backgroundColor: color }}
                            className="w-7 h-7 rounded-full border border-black/10 active:scale-90"
                          />
                        ),
                      )}
                      <Pressable
                        onPress={() => toggleHighlight("")}
                        className="w-7 h-7 rounded-full bg-transparent border border-[#60646C] dark:border-[#B0B4BA] items-center justify-center active:scale-90"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={12}
                          color={isDark ? "#B0B4BA" : "#60646C"}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Action Items List */}
                  <View className="flex-row justify-between gap-x-3">
                    <Pressable
                      onPress={copyVerse}
                      className="flex-1 flex-row items-center justify-center bg-[#FAF8F5] dark:bg-[#2E3135] border border-[#E0E1E6] dark:border-[#3E4249] h-12 rounded-xl active:bg-[#F3EFE6]"
                    >
                      <Ionicons
                        name="copy-outline"
                        size={16}
                        color={isDark ? "#F3F4F6" : "#1C1917"}
                        className="mr-2"
                      />
                      <Text className="text-sm font-semibold text-[#1C1917] dark:text-[#F3F4F6] ml-2">
                        Copy
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={shareVerse}
                      className="flex-1 flex-row items-center justify-center bg-[#1E40AF] dark:bg-[#2563EB] h-12 rounded-xl active:opacity-90"
                    >
                      <Ionicons
                        name="share-outline"
                        size={16}
                        color="white"
                        className="mr-2"
                      />
                      <Text className="text-sm font-semibold text-white ml-2">
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
