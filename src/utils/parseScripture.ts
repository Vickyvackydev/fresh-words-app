import { BIBLE_BOOK_NAMES } from "./bibleTranslations";

export interface ParsedScripture {
  book: string;
  chapter: number;
  verse?: number;
  rawRef: string;
}

const BOOK_ALIASES: Record<string, string> = {
  psalm: "Psalms",
  psalms: "Psalms",
  ps: "Psalms",
  "song of songs": "Song of Solomon",
  canticles: "Song of Solomon",
  "1 cor": "1 Corinthians",
  "1 corinthians": "1 Corinthians",
  "2 cor": "2 Corinthians",
  "2 corinthians": "2 Corinthians",
  "1 thess": "1 Thessalonians",
  "1 thessalonians": "1 Thessalonians",
  "2 thess": "2 Thessalonians",
  "2 thessalonians": "2 Thessalonians",
  "1 tim": "1 Timothy",
  "1 timothy": "1 Timothy",
  "2 tim": "2 Timothy",
  "2 timothy": "2 Timothy",
  "1 sam": "1 Samuel",
  "1 samuel": "1 Samuel",
  "2 sam": "2 Samuel",
  "2 samuel": "2 Samuel",
  "1 kgs": "1 Kings",
  "1 kings": "1 Kings",
  "2 kgs": "2 Kings",
  "2 kings": "2 Kings",
  "1 chron": "1 Chronicles",
  "1 chronicles": "1 Chronicles",
  "2 chron": "2 Chronicles",
  "2 chronicles": "2 Chronicles",
  "1 pet": "1 Peter",
  "1 peter": "1 Peter",
  "2 pet": "2 Peter",
  "2 peter": "2 Peter",
  "1 jn": "1 John",
  "1 john": "1 John",
  "2 jn": "2 John",
  "2 john": "2 John",
  "3 jn": "3 John",
  "3 john": "3 John",
  matt: "Matthew",
  matthew: "Matthew",
  mk: "Mark",
  mark: "Mark",
  lk: "Luke",
  luke: "Luke",
  jn: "John",
  john: "John",
  acts: "Acts",
  rom: "Romans",
  romans: "Romans",
  gen: "Genesis",
  genesis: "Genesis",
  ex: "Exodus",
  exod: "Exodus",
  exodus: "Exodus",
  lev: "Leviticus",
  leviticus: "Leviticus",
  num: "Numbers",
  numbers: "Numbers",
  deut: "Deuteronomy",
  deuteronomy: "Deuteronomy",
  josh: "Joshua",
  joshua: "Joshua",
  judg: "Judges",
  judges: "Judges",
  prov: "Proverbs",
  proverbs: "Proverbs",
  eccl: "Ecclesiastes",
  ecclesiastes: "Ecclesiastes",
  isa: "Isaiah",
  isaiah: "Isaiah",
  jer: "Jeremiah",
  jeremiah: "Jeremiah",
  lam: "Lamentations",
  lamentations: "Lamentations",
  ezek: "Ezekiel",
  ezekiel: "Ezekiel",
  dan: "Daniel",
  daniel: "Daniel",
  hos: "Hosea",
  hosea: "Hosea",
  hab: "Habakkuk",
  habakkuk: "Habakkuk",
  zeph: "Zephaniah",
  zephaniah: "Zephaniah",
  hag: "Haggai",
  haggai: "Haggai",
  zech: "Zechariah",
  zechariah: "Zechariah",
  mal: "Malachi",
  malachi: "Malachi",
  gal: "Galatians",
  galatians: "Galatians",
  eph: "Ephesians",
  ephesians: "Ephesians",
  phil: "Philippians",
  philippians: "Philippians",
  col: "Colossians",
  colossians: "Colossians",
  tit: "Titus",
  titus: "Titus",
  philem: "Philemon",
  philemon: "Philemon",
  heb: "Hebrews",
  hebrews: "Hebrews",
  jas: "James",
  james: "James",
  rev: "Revelation",
  revelation: "Revelation",
};

/**
 * Resolves any raw, localized, or abbreviated book name to the standard English book name.
 */
export function resolveStandardBookName(bookName: string): string {
  const clean = (bookName || "").trim();
  const lower = clean.toLowerCase();

  // 1. Check known alias / common names map
  if (BOOK_ALIASES[lower]) {
    return BOOK_ALIASES[lower];
  }

  // 2. Direct match against standard BIBLE_BOOK_NAMES in English
  for (const transMap of Object.values(BIBLE_BOOK_NAMES)) {
    if (transMap.en && transMap.en.toLowerCase() === lower) {
      return transMap.en;
    }
  }

  // 3. Match against translations in BIBLE_BOOK_NAMES (French, Spanish, Yoruba, etc.)
  for (const transMap of Object.values(BIBLE_BOOK_NAMES)) {
    for (const localized of Object.values(transMap)) {
      if (
        localized.toLowerCase() === lower ||
        localized.toLowerCase().replace(/\s+/g, "") === lower.replace(/\s+/g, "")
      ) {
        return transMap.en;
      }
    }
  }

  // 4. Prefix match against BIBLE_BOOK_NAMES English entries
  for (const transMap of Object.values(BIBLE_BOOK_NAMES)) {
    if (transMap.en && transMap.en.toLowerCase().startsWith(lower)) {
      return transMap.en;
    }
  }

  return clean;
}

/**
 * Parses scripture references like:
 * - "Hebrews 11:1-3" -> { book: "Hebrews", chapter: 11, verse: 1 }
 * - "Psalm 23:1" -> { book: "Psalms", chapter: 23, verse: 1 }
 * - "1 Corinthians 13:4-8" -> { book: "1 Corinthians", chapter: 13, verse: 4 }
 * - "John 3:16" -> { book: "John", chapter: 3, verse: 16 }
 * - "Genesis 1" -> { book: "Genesis", chapter: 1, verse: undefined }
 * - "Psaumes 23:1" -> { book: "Psalms", chapter: 23, verse: 1 }
 */
export function parseScriptureReference(scriptureRef?: string): ParsedScripture | null {
  if (!scriptureRef || typeof scriptureRef !== "string") return null;

  let cleaned = scriptureRef.trim();

  // Remove surrounding quotes or parentheses
  cleaned = cleaned.replace(/^["'(\[]+|["')\]]+$/g, "").trim();

  // Clean deduplicated artifact strings (e.g. "Chronicles onicles")
  cleaned = cleaned.replace(/2 Chronicles onicles/gi, "2 Chronicles");
  cleaned = cleaned.replace(/1 Chronicles onicles/gi, "1 Chronicles");
  cleaned = cleaned.replace(/([A-Za-z]+)\s+\1/gi, "$1");

  // Remove translation suffix in parentheses or at end (e.g. "(NIV)", "KJV", "(NKJV)", "ESV", "NLT")
  cleaned = cleaned.replace(/\s*\((?:KJV|NKJV|NIV|ESV|NLT|AMP|MSG|CSB|NASB|RSV)\)/gi, "");
  cleaned = cleaned.replace(/\s+(?:KJV|NKJV|NIV|ESV|NLT|AMP|MSG|CSB|NASB|RSV)\b/gi, "").trim();

  // Regex captures:
  // Group 1: Book name with optional digit prefix (e.g., "1 John", "2 Corinthians", "Psalm", "Song of Solomon")
  // Group 2: Chapter number
  // Group 3: Optional starting verse number
  const regex = /^((?:[1-3I]{1,3}\s+)?[A-Za-zÀ-ÿ\s'-]+?)\s+(\d+)(?:[:.](\d+))?/;
  const match = cleaned.match(regex);

  if (match) {
    const rawBook = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;

    if (isNaN(chapter) || chapter <= 0) return null;

    const standardBook = resolveStandardBookName(rawBook);

    return {
      book: standardBook,
      chapter,
      verse: verse && !isNaN(verse) && verse > 0 ? verse : undefined,
      rawRef: scriptureRef,
    };
  }

  return null;
}
