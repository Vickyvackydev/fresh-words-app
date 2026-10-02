export interface LocalizedBook {
  name: string;
  testament: "Old" | "New";
}

export const BIBLE_BOOK_NAMES: Record<string, Record<string, string>> = {
  gn: { en: "Genesis", fr: "Genèse", es: "Génesis", yo: "Jẹ́nẹ́sísì", ig: "Jenesis", ha: "Farawa", pt: "Gênesis" },
  ex: { en: "Exodus", fr: "Exode", es: "Éxodo", yo: "Ẹ́kísódù", ig: "Ọ́pụpụ", ha: "Fitowa", pt: "Êxodo" },
  lv: { en: "Leviticus", fr: "Lévitique", es: "Levítico", yo: "Léfítíkù", ig: "Levitikọs", ha: "Levitikus", pt: "Levítico" },
  nm: { en: "Numbers", fr: "Nombres", es: "Números", yo: "Nọ́ḿbà", ig: "Ọnụọgụgụ", ha: "Ƙidaya", pt: "Números" },
  dt: { en: "Deuteronomy", fr: "Deutéronome", es: "Deuteronomio", yo: "Diútérónómì", ig: "Diuteronomi", ha: "Maimaitawar Shari'a", pt: "Deuteronômio" },
  js: { en: "Joshua", fr: "Josué", es: "Josué", yo: "Jóṣúà", ig: "Joshua", ha: "Joshua", pt: "Josué" },
  jg: { en: "Judges", fr: "Juges", es: "Jueces", yo: "Àwọn Onídàájọ́", ig: "Ndị Ikpe", ha: "Masu Shari'a", pt: "Juízes" },
  rt: { en: "Ruth", fr: "Ruth", es: "Rut", yo: "Rúùtù", ig: "Rut", ha: "Rutu", pt: "Rute" },
  "1s": { en: "1 Samuel", fr: "1 Samuel", es: "1 Samuel", yo: "1 Sámúẹ́lì", ig: "1 Samuel", ha: "1 Sama'ila", pt: "1 Samuel" },
  "2s": { en: "2 Samuel", fr: "2 Samuel", es: "2 Samuel", yo: "2 Sámúẹ́lì", ig: "2 Samuel", ha: "2 Sama'ila", pt: "2 Samuel" },
  "1k": { en: "1 Kings", fr: "1 Rois", es: "1 Reyes", yo: "1 Àwọn Ọba", ig: "1 Ndị Eze", ha: "1 Sarakuna", pt: "1 Reis" },
  "2k": { en: "2 Kings", fr: "2 Rois", es: "2 Reyes", yo: "2 Àwọn Ọba", ig: "2 Ndị Eze", ha: "2 Sarakuna", pt: "2 Reis" },
  "1ch": { en: "1 Chronicles", fr: "1 Chroniques", es: "1 Crónicas", yo: "1 Kíróníkà", ig: "1 Ihe E Mere", ha: "1 Labarbaru", pt: "1 Crônicas" },
  "2ch": { en: "2 Chronicles", fr: "2 Chroniques", es: "2 Crónicas", yo: "2 Kíróníkà", ig: "2 Ihe E Mere", ha: "2 Labarbaru", pt: "2 Crônicas" },
  ez: { en: "Ezra", fr: "Esdras", es: "Esdras", yo: "Ẹ́sírà", ig: "Ezra", ha: "Ezra", pt: "Esdras" },
  ne: { en: "Nehemiah", fr: "Néhémie", es: "Nehemías", yo: "Nehemáyà", ig: "Nehemaya", ha: "Nehemiya", pt: "Neemias" },
  es: { en: "Esther", fr: "Esther", es: "Ester", yo: "Ẹ́sítérì", ig: "Esta", ha: "Esta", pt: "Ester" },
  jb: { en: "Job", fr: "Job", es: "Job", yo: "Jóòbù", ig: "Job", ha: "Ayuba", pt: "Jó" },
  ps: { en: "Psalms", fr: "Psaumes", es: "Salmos", yo: "Sáàmù", ig: "Abụ Ọma", ha: "Zabura", pt: "Salmos" },
  pr: { en: "Proverbs", fr: "Proverbes", es: "Proverbios", yo: "Òwe", ig: "Ilu", ha: "Misalai", pt: "Provérbios" },
  ec: { en: "Ecclesiastes", fr: "Ecclésiaste", es: "Eclesiastés", yo: "Oníwàásù", ig: "Eklisiastis", ha: "Mai Hadishi", pt: "Eclesiastes" },
  sn: { en: "Song of Solomon", fr: "Cantique des Cantiques", es: "Cantares", yo: "Orin Sólómọ́nì", ig: "Abụ nke Solomon", ha: "Waƙar Waƙoƙi", pt: "Cânticos" },
  is: { en: "Isaiah", fr: "Ésaïe", es: "Isaías", yo: "Àìsáyà", ig: "Aịzaya", ha: "Ishaya", pt: "Isaías" },
  jr: { en: "Jeremiah", fr: "Jérémie", es: "Jeremías", yo: "Jeremáyà", ig: "Jeremaya", ha: "Irmiya", pt: "Jeremias" },
  lm: { en: "Lamentations", fr: "Lamentations", es: "Lamentaciones", yo: "Ẹkún Jeremáyà", ig: "Akwa Arịrị", ha: "Makoki", pt: "Lamentações" },
  ek: { en: "Ezekiel", fr: "Ézéchiel", es: "Ezequiel", yo: "Ìsíkíẹ́lì", ig: "Izikiel", ha: "Ezekiyel", pt: "Ezequiel" },
  dn: { en: "Daniel", fr: "Daniel", es: "Daniel", yo: "Dáníẹ́lì", ig: "Daniel", ha: "Daniyel", pt: "Daniel" },
  hs: { en: "Hosea", fr: "Osée", es: "Oseas", yo: "Hòṣéà", ig: "Hosea", ha: "Hosiya", pt: "Oseias" },
  jl: { en: "Joel", fr: "Joël", es: "Joel", yo: "Jóẹ́lì", ig: "Joel", ha: "Yowel", pt: "Joel" },
  am: { en: "Amos", fr: "Amos", es: "Amós", yo: "Ámọ́sì", ig: "Emọs", ha: "Amos", pt: "Amós" },
  ob: { en: "Obadiah", fr: "Abdias", es: "Abdías", yo: "Ọbadáyà", ig: "Ọbadaya", ha: "Obadiya", pt: "Obadias" },
  jn: { en: "Jonah", fr: "Jonas", es: "Jonás", yo: "Jónà", ig: "Jona", ha: "Yunus", pt: "Jonas" },
  mi: { en: "Micah", fr: "Michée", es: "Miqueas", yo: "Míkà", ig: "Maịka", ha: "Mika", pt: "Miqueias" },
  na: { en: "Nahum", fr: "Nahum", es: "Nahúm", yo: "Náhúmù", ig: "Nahum", ha: "Nahum", pt: "Naum" },
  hk: { en: "Habakkuk", fr: "Habacuc", es: "Habacuc", yo: "Hábákúkù", ig: "Habakọk", ha: "Habakkuk", pt: "Habacuque" },
  zp: { en: "Zephaniah", fr: "Sophonie", es: "Sofonías", yo: "Sẹfanáyà", ig: "Zefanaya", ha: "Zefaniya", pt: "Sofonias" },
  hg: { en: "Haggai", fr: "Aggée", es: "Hageo", yo: "Hágáì", ig: "Hagaị", ha: "Haggai", pt: "Ageu" },
  zc: { en: "Zechariah", fr: "Zacharie", es: "Zacarías", yo: "Sekaráyà", ig: "Zekaraya", ha: "Zakariya", pt: "Zacarias" },
  ml: { en: "Malachi", fr: "Malachie", es: "Malaquías", yo: "Málákì", ig: "Malakaị", ha: "Malaki", pt: "Malaquias" },
  mt: { en: "Matthew", fr: "Matthieu", es: "Mateo", yo: "Mátíù", ig: "Matiu", ha: "Matiyu", pt: "Mateus" },
  mk: { en: "Mark", fr: "Marc", es: "Marcos", yo: "Máàkù", ig: "Mak", ha: "Markus", pt: "Marcos" },
  lk: { en: "Luke", fr: "Luc", es: "Lucas", yo: "Lúùkù", ig: "Luk", ha: "Luka", pt: "Lucas" },
  jo: { en: "John", fr: "Jean", es: "Juan", yo: "Jòhánù", ig: "Jọn", ha: "Yohanna", pt: "João" },
  ac: { en: "Acts", fr: "Actes", es: "Hechos", yo: "Ìṣe Àwọn Àpọ́sítélì", ig: "Ọrụ Ndị Ozi", ha: "Ayyukan Manzanni", pt: "Atos" },
  rm: { en: "Romans", fr: "Romains", es: "Romanos", yo: "Róòmù", ig: "Ndị Rom", ha: "Romawa", pt: "Romanos" },
  "1co": { en: "1 Corinthians", fr: "1 Corinthiens", es: "1 Corintios", yo: "1 Kọ́ríńtì", ig: "1 Ndị Kọrịnt", ha: "1 Korinthiyawa", pt: "1 Coríntios" },
  "2co": { en: "2 Corinthians", fr: "2 Corinthiens", es: "2 Corintios", yo: "2 Kọ́ríńtì", ig: "2 Ndị Kọrịnt", ha: "2 Korinthiyawa", pt: "2 Coríntios" },
  gl: { en: "Galatians", fr: "Galates", es: "Gálatas", yo: "Gálátíà", ig: "Ndị Galetia", ha: "Galatiyawa", pt: "Gálatas" },
  ep: { en: "Ephesians", fr: "Éphésiens", es: "Efesios", yo: "Éfésù", ig: "Ndị Efesọs", ha: "Afisawa", pt: "Efésios" },
  ph: { en: "Philippians", fr: "Philippiens", es: "Filipenses", yo: "Fílípì", ig: "Ndị Filipaị", ha: "Filibiyawa", pt: "Filipenses" },
  cl: { en: "Colossians", fr: "Colossiens", es: "Colosenses", yo: "Kólósè", ig: "Ndị Kọlọsi", ha: "Kolosiyawa", pt: "Colossenses" },
  "1th": { en: "1 Thessalonians", fr: "1 Thessaloniciens", es: "1 Tesalonicenses", yo: "1 Tẹsalóníkà", ig: "1 Ndị Tesalonaịka", ha: "1 Tasalonikawa", pt: "1 Tessalonicenses" },
  "2th": { en: "2 Thessalonians", fr: "2 Thessaloniciens", es: "2 Tesalonicenses", yo: "2 Tẹsalóníkà", ig: "2 Ndị Tesalonaịka", ha: "2 Tasalonikawa", pt: "2 Tessalonicenses" },
  "1ti": { en: "1 Timothy", fr: "1 Timothée", es: "1 Timoteo", yo: "1 Tímótì", ig: "1 Timoti", ha: "1 Timawoti", pt: "1 Timóteo" },
  "2ti": { en: "2 Timothy", fr: "2 Timothée", es: "2 Timoteo", yo: "2 Tímótì", ig: "2 Timoti", ha: "2 Timawoti", pt: "2 Timóteo" },
  tt: { en: "Titus", fr: "Tite", es: "Tito", yo: "Títù", ig: "Taịtọs", ha: "Titus", pt: "Tito" },
  phm: { en: "Philemon", fr: "Philémon", es: "Filemón", yo: "Fílémónì", ig: "Faịlimọn", ha: "Filimon", pt: "Filemom" },
  hb: { en: "Hebrews", fr: "Hébreux", es: "Hebreos", yo: "Hébérù", ig: "Ndị Hibru", ha: "Ibraniyawa", pt: "Hebreus" },
  jm: { en: "James", fr: "Jacques", es: "Santiago", yo: "Jákọ́bù", ig: "Jemis", ha: "Yaƙub", pt: "Tiago" },
  "1pe": { en: "1 Peter", fr: "1 Pierre", es: "1 Pedro", yo: "1 Pétérù", ig: "1 Pita", ha: "1 Bitrus", pt: "1 Pedro" },
  "2pe": { en: "2 Peter", fr: "2 Pierre", es: "2 Pedro", yo: "2 Pétérù", ig: "2 Pita", ha: "2 Bitrus", pt: "2 Pedro" },
  "1jo": { en: "1 John", fr: "1 Jean", es: "1 Juan", yo: "1 Jòhánù", ig: "1 Jọn", ha: "1 Yohanna", pt: "1 João" },
  "2jo": { en: "2 John", fr: "2 Jean", es: "2 Juan", yo: "2 Jòhánù", ig: "2 Jọn", ha: "2 Yohanna", pt: "2 João" },
  "3jo": { en: "3 John", fr: "3 Jean", es: "3 Juan", yo: "3 Jòhánù", ig: "3 Jọn", ha: "3 Yohanna", pt: "3 João" },
  jd: { en: "Jude", fr: "Jude", es: "Judas", yo: "Júdà", ig: "Jud", ha: "Yahuza", pt: "Judas" },
  rv: { en: "Revelation", fr: "Apocalypse", es: "Apocalipsis", yo: "Ìfihàn", ig: "Mkpughe", ha: "Ru'ya Ta Yohanna", pt: "Apocalipse" },
};

export function getLocalizedBookName(abbrevOrName: string, lang: string = "en"): string {
  const cleanLang = (lang || "en").toLowerCase();
  const lower = (abbrevOrName || "").trim().toLowerCase();

  // 1. Direct match by abbreviation
  if (BIBLE_BOOK_NAMES[lower] && BIBLE_BOOK_NAMES[lower][cleanLang]) {
    return BIBLE_BOOK_NAMES[lower][cleanLang];
  }

  // 2. Match by English name or any existing localized name
  for (const [_, transMap] of Object.entries(BIBLE_BOOK_NAMES)) {
    for (const [l, n] of Object.entries(transMap)) {
      if (n.toLowerCase() === lower || n.toLowerCase().replace(/\s+/g, "") === lower.replace(/\s+/g, "")) {
        return transMap[cleanLang] || transMap.en || abbrevOrName;
      }
    }
  }

  return abbrevOrName;
}
