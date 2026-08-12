import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  RefreshCw, 
  BookOpen, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  Info,
  Sparkles,
  Award,
  Compass,
  Sliders,
  MessageSquare,
  Zap,
  TrendingUp,
  Smile,
  Users,
  Check,
  Flame,
  Book,
  Anchor,
  Calendar,
  X,
  MoreHorizontal,
  Download,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";
import { BookCover } from "./components/BookCover";
import { ProjectIcon } from "./components/ProjectIcon";
import { useTour, TourManager } from "./components/Tour";


function getLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateForInput(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Devotional {
  id: string;
  title: string;
  link: string;
  cover: string;
  description: string;
}

interface PronunciationOverride {
  text: string;
  occurrence: number;
  token: string;
}

interface DevotionalBlock {
  id: string;
  type: "scripture" | "body";
  text: string;
  pronunciationOverrides?: PronunciationOverride[];
}

export const PRONUNCIATION_REPLACEMENTS: Record<string, string> = {
  LIVE_VERB: "liv",
  LIVE_ADJECTIVE: "lyve",
  READ_PRESENT: "reed",
  READ_PAST: "red",
  LEAD_VERB: "leed",
  LEAD_METAL: "led",
  WIND_AIR: "wind",
  WIND_TURN: "wynd",
  TEAR_RIP: "tare",
  TEAR_CRY: "teer",
  BASS_MUSIC: "base",
  BASS_FISH: "bass",
  CLOSE_NEAR: "klohs",
  CLOSE_SHUT: "cloze",
  MINUTE_TIME: "minnit",
  MINUTE_TINY: "mynewt",
  OBJECT_NOUN: "objikt",
  OBJECT_VERB: "ubjekt",
  RECORD_NOUN: "rekurd",
  RECORD_VERB: "rikord",
  PRESENT_NOUN: "prezunt",
  PRESENT_VERB: "pruzent"
};

function replaceNthWord(paragraphText: string, targetWord: string, occurrence: number, replacement: string): string {
  if (!paragraphText || !targetWord) return paragraphText || "";
  const escaped = targetWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  
  let currentCount = 0;
  return paragraphText.replace(regex, (match) => {
    currentCount++;
    if (currentCount === occurrence) {
      const isCapitalized = match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase();
      if (isCapitalized && replacement && replacement.length > 0) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement || "";
    }
    return match;
  });
}

interface DevotionalContent {
  title: string;
  paragraphs: DevotionalBlock[];
  warning?: string;
  isFallback?: boolean;
}

export const DEVOTIONAL_PROFILES = [
  {
    id: "classic",
    name: "Classic / Original",
    description: "Ellen White's authentic, reverent 19th-century text verbatim",
    icon: BookOpen,
    badge: ""
  },
  {
    id: "clear_modern",
    name: "Clear & Modern",
    description: "Dignified, respectful, and articulate modern English with active phrasing",
    icon: Compass,
    badge: "Professional Adult"
  },
  {
    id: "easy_reading",
    name: "Easy Reading",
    description: "A highly accessible version using clear language, simplified vocabulary, and direct sentence structures for easy comprehension.",
    badge: "Simplified English",
    icon: Book
  },
  {
    id: "young_adult",
    name: "Young Adult",
    description: "An authentic, thought-provoking adaptation that reframes scriptural themes around modern culture, ethics, and identity.",
    badge: "Collegiate & YA",
    icon: Compass
  },
  {
    id: "teens_youth",
    name: "Teens & Youth",
    description: "An engaging, supportive message that translates spiritual principles into the real-world experiences and peer dynamics of middle and high schoolers.",
    badge: "Middle & High School",
    icon: Anchor
  },
  {
    id: "kids_primary",
    name: "Kids & Primary",
    description: "An enthusiastic, story-driven journey that brings lessons to life for young minds using concrete examples and rich sensory details.",
    badge: "Early Elementary",
    icon: Smile
  }
];

export interface VoiceProfile {
  rate: number;
  pitch: number;
  genderPref: "male" | "female" | "any";
}

export const PROFILE_VOICE_CONFIGS: Record<string, VoiceProfile> = {
  classic: {
    rate: 0.85,
    pitch: 0.85,
    genderPref: "male"
  },
  clear_modern: {
    rate: 1.0,
    pitch: 1.0,
    genderPref: "female"
  },
  easy_reading: {
    rate: 0.9,
    pitch: 1.0,
    genderPref: "female"
  },
  young_adult: {
    rate: 1.0,
    pitch: 1.0,
    genderPref: "any"
  },
  teens_youth: {
    rate: 1.02,
    pitch: 1.05,
    genderPref: "any"
  },
  kids_primary: {
    rate: 0.95,
    pitch: 1.1,
    genderPref: "female"
  }
};

export const dailyDevotionals = [
  {
    id: "ohc",
    title: "Our High Calling",
    cover: "https://media2.egwwritings.org/covers/81_s.jpg",
    link: "https://whiteestate.org/devotional/ohc/",
    description: "This devotional classic calls readers to holiness, spiritual maturity, and a deeper commitment to Christ. It explores faith, temptation, salvation, and the challenges of wealth, criticism, and suffering."
  },
  {
    id: "fh",
    title: "From the Heart",
    cover: "https://media2.egwwritings.org/covers/12210_s.jpg",
    link: "https://whiteestate.org/devotional/fh/",
    description: "These messages were written to guide searching hearts toward Jesus and prepare believers for His soon return. They offer encouragement, wisdom, and gentle correction for a closer walk with God."
  },
  {
    id: "ul",
    title: "The Upward Look",
    cover: "https://media2.egwwritings.org/covers/147_s.jpg",
    link: "https://whiteestate.org/devotional/ul/",
    description: "This devotional keeps the reader's eyes fixed on Jesus as both example and source of saving grace. Its reflections lift the heart heavenward and strengthen faith step by step."
  },
  {
    id: "tmk",
    title: "That I May Know Him",
    cover: "https://media2.egwwritings.org/covers/126_s.jpg",
    link: "https://whiteestate.org/devotional/tmk/",
    description: "These readings invite readers into a fuller knowledge of God through warm, personal messages and intimate reflections. They reveal the heart of prayer, devotion, and a life centered on Christ."
  },
  {
    id: "rc",
    title: "Reflecting Christ",
    cover: "https://media2.egwwritings.org/covers/89_s.jpg",
    link: "https://whiteestate.org/devotional/rc/",
    description: "A Christ-centered devotional that encourages believers to walk in the footsteps of Jesus. It highlights the beauty of a life shaped by His character and love."
  },
  {
    id: "ctr",
    title: "Christ Triumphant",
    cover: "https://media2.egwwritings.org/covers/9_s.jpg",
    link: "https://whiteestate.org/devotional/ctr/",
    description: "These daily readings draw from the great controversy theme and focus on God's power to overcome. They strengthen hope by pointing to the triumph of Christ over evil."
  },
  {
    id: "cc",
    title: "Conflict and Courage",
    cover: "https://media2.egwwritings.org/covers/17_s.jpg",
    link: "https://whiteestate.org/devotional/cc/",
    description: "This devotional traces decisive moments in salvation history and shows how the past still speaks to the present. It offers counsel, courage, and hope for faithful living today."
  },
  {
    id: "ag",
    title: "God's Amazing Grace",
    cover: "https://media2.egwwritings.org/covers/33_s.jpg",
    link: "https://whiteestate.org/devotional/ag/",
    description: "These reflections invite readers to experience the peace and strength that come from daily communion with God. They celebrate grace as the power that changes the heart and shapes the life."
  },
  {
    id: "hp",
    title: "In Heavenly Places",
    cover: "https://media2.egwwritings.org/covers/38_s.jpg",
    link: "https://whiteestate.org/devotional/hp/",
    description: "This collection brings readers into a deeper understanding of Christ's character and the work of heaven. It encourages a life of devotion, surrender, and holy fellowship with God."
  },
  {
    id: "lhu",
    title: "Lift Him Up",
    cover: "https://media2.egwwritings.org/covers/44_s.jpg",
    link: "https://whiteestate.org/devotional/lhu/",
    description: "These reflections center on Jesus as Teacher, Healer, King, and Redeemer. They call readers to behold Him more clearly and be transformed by His likeness."
  },
  {
    id: "mar",
    title: "Maranatha",
    cover: "https://media2.egwwritings.org/covers/74_s.jpg",
    link: "https://whiteestate.org/devotional/mar/",
    description: "This devotional focuses on the blessed hope of Christ's soon return. It stirs longing for deliverance and renewed faith in the promises of God."
  },
  {
    id: "mlt",
    title: "My Life Today",
    cover: "https://media2.egwwritings.org/covers/79_s.jpg",
    link: "https://whiteestate.org/devotional/mlt/",
    description: "These readings touch nearly every area of the Christian life with warmth and practical insight. They remind readers of God's fatherly love and the call to live fully for Him."
  },
  {
    id: "ofc",
    title: "Our Father Cares",
    cover: "https://media2.egwwritings.org/covers/80_s.jpg",
    link: "https://whiteestate.org/devotional/ofc/",
    description: "This devotional explores the Father's love for His children and the comfort of being held by Him. It encourages trust, gratitude, and hope in the midst of life's struggles."
  },
  {
    id: "blj",
    title: "To Be Like Jesus",
    cover: "https://media2.egwwritings.org/covers/151_s.jpg",
    link: "https://whiteestate.org/devotional/blj/",
    description: "These devotionals call believers into deeper fellowship with God and a life shaped by Christ's likeness. They invite readers to walk closely with the Shepherd and follow Him day by day."
  },
  {
    id: "flb",
    title: "The Faith I Live By",
    cover: "https://media2.egwwritings.org/covers/131_s.jpg",
    link: "https://whiteestate.org/devotional/flb/",
    description: "This devotional is devoted to the foundational truths of Scripture and the doctrines that strengthen faith. It offers daily reflection that is both inspiring and instructive."
  },
  {
    id: "hb",
    title: "Homeward Bound",
    cover: "https://media2.egwwritings.org/covers/12862_s.jpg",
    link: "https://whiteestate.org/devotional/hb/",
    description: "These readings encourage surrender, victory in Christ, and hope as believers journey toward home. They reflect major themes of faith, holiness, and the great controversy."
  },
  {
    id: "rre",
    title: "Radiant Religion",
    cover: "https://media2.egwwritings.org/covers/14039_s.jpg",
    link: "https://whiteestate.org/devotional/rre/",
    description: "This early devotional collection reflects the spiritual life of earnest discipleship. It offers a foundational look at living with radiant faith and purpose."
  },
  {
    id: "sd",
    title: "Sons and Daughters of God",
    cover: "https://media2.egwwritings.org/covers/102_s.jpg",
    link: "https://whiteestate.org/devotional/sd/",
    description: "These reflections invite readers to pursue the highest standard of spiritual attainment in Christ. They emphasize the cross, holiness, and the dignity of belonging to God."
  },
  {
    id: "tdg",
    title: "This Day with God",
    cover: "https://media2.egwwritings.org/covers/149_s.jpg",
    link: "https://whiteestate.org/devotional/tdg/",
    description: "This devotional is arranged by the day they were written, giving the reader a personal and historical glimpse into Ellen White's counsel. It offers encouragement, wisdom, and hope."
  },
  {
    id: "wgd",
    title: "With God at Dawn",
    cover: "https://media2.egwwritings.org/covers/13940_s.jpg",
    link: "https://whiteestate.org/devotional/wgd/",
    description: "These readings begin the day with spiritual focus and renewed commitment to God. They are designed to help readers meet each morning with reverence and purpose."
  },
  {
    id: "yrp",
    title: "Ye Shall Receive Power",
    cover: "https://media2.egwwritings.org/covers/153_s.jpg",
    link: "https://whiteestate.org/devotional/yrp/",
    description: "A devotional that highlights the promise and power of the Holy Spirit in everyday discipleship. It encourages readers to welcome His presence and cooperate with His work."
  },
  {
    id: "jnn",
    title: "Jesus, Name Above All Names",
    cover: "https://media2.egwwritings.org/covers/14150_s.jpg",
    link: "https://whiteestate.org/devotional/jnn/",
    description: "This devotional explores the many names of Jesus and draws readers into deeper love for Him. It offers a fresh, intimate way to behold the Savior each day."
  }
];

function numberToWords(n: number): string {
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return tens[t] + (r > 0 ? "-" + ones[r] : "");
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return ones[h] + " hundred" + (r > 0 ? " " + numberToWords(r) : "");
  }
  return String(n);
}

function isSingleChapterBook(book: string): boolean {
  const norm = book.toLowerCase().trim();
  return norm.includes("obadiah") ||
         norm.includes("philemon") ||
         norm.includes("jude") ||
         (norm.includes("john") && (norm.includes("2") || norm.includes("3") || norm.includes("second") || norm.includes("third") || norm.includes("ii") || norm.includes("iii")));
}

function verbalizeBook(book: string): string {
  if (!book) return "";
  let b = book.trim();
  b = b.replace(/\s+/g, " ");
  
  if (/^1\s+/i.test(b) || /^I\s+/i.test(b) || /^1st\s+/i.test(b)) {
    b = "First " + b.replace(/^(?:1|I|1st)\s+/i, "");
  } else if (/^2\s+/i.test(b) || /^II\s+/i.test(b) || /^2nd\s+/i.test(b)) {
    b = "Second " + b.replace(/^(?:2|II|2nd)\s+/i, "");
  } else if (/^3\s+/i.test(b) || /^III\s+/i.test(b) || /^3rd\s+/i.test(b)) {
    b = "Third " + b.replace(/^(?:3|III|3rd)\s+/i, "");
  } else if (/^1[a-zA-Z]/i.test(b)) {
    b = "First " + b.substring(1);
  } else if (/^2[a-zA-Z]/i.test(b)) {
    b = "Second " + b.substring(1);
  } else if (/^3[a-zA-Z]/i.test(b)) {
    b = "Third " + b.substring(1);
  }
  
  b = b.replace(/\.$/, "");
  
  const bookLower = b.toLowerCase();
  if (bookLower.endsWith("gen") || bookLower.endsWith("gene")) return b.replace(/gen(?:e)?/i, "Genesis");
  if (bookLower.endsWith("ex") || bookLower.endsWith("exod")) return b.replace(/ex(?:od)?/i, "Exodus");
  if (bookLower.endsWith("lev")) return b.replace(/lev/i, "Leviticus");
  if (bookLower.endsWith("num")) return b.replace(/num/i, "Numbers");
  if (bookLower.endsWith("deut")) return b.replace(/deut/i, "Deuteronomy");
  if (bookLower.endsWith("josh")) return b.replace(/josh/i, "Joshua");
  if (bookLower.endsWith("judg")) return b.replace(/judg/i, "Judges");
  if (bookLower.endsWith("sam")) return b.replace(/sam/i, "Samuel");
  if (bookLower.endsWith("chron")) return b.replace(/chron/i, "Chronicles");
  if (bookLower.endsWith("neh")) return b.replace(/neh/i, "Nehemiah");
  if (bookLower.endsWith("est") || bookLower.endsWith("esth")) return b.replace(/esth?/i, "Esther");
  if (bookLower.endsWith("psa") || bookLower.endsWith("psalms")) return b.replace(/psa(?:lms)?/i, "Psalm");
  if (bookLower.endsWith("prov")) return b.replace(/prov/i, "Proverbs");
  if (bookLower.endsWith("eccl")) return b.replace(/eccl/i, "Ecclesiastes");
  if (bookLower.endsWith("song")) return b.replace(/song/i, "Song of Solomon");
  if (bookLower.endsWith("isa")) return b.replace(/isa/i, "Isaiah");
  if (bookLower.endsWith("jer")) return b.replace(/jer/i, "Jeremiah");
  if (bookLower.endsWith("lam")) return b.replace(/lam/i, "Lamentations");
  if (bookLower.endsWith("eze") || bookLower.endsWith("ezek")) return b.replace(/ezek?/i, "Ezekiel");
  if (bookLower.endsWith("dan")) return b.replace(/dan/i, "Daniel");
  if (bookLower.endsWith("hos")) return b.replace(/hos/i, "Hosea");
  if (bookLower.endsWith("obad")) return b.replace(/obad/i, "Obadiah");
  if (bookLower.endsWith("mic")) return b.replace(/mic/i, "Micah");
  if (bookLower.endsWith("nah")) return b.replace(/nah/i, "Nahum");
  if (bookLower.endsWith("hab")) return b.replace(/hab/i, "Habakkuk");
  if (bookLower.endsWith("zeph")) return b.replace(/zeph/i, "Zephaniah");
  if (bookLower.endsWith("hag")) return b.replace(/hag/i, "Haggai");
  if (bookLower.endsWith("zech")) return b.replace(/zech/i, "Zechariah");
  if (bookLower.endsWith("mal")) return b.replace(/mal/i, "Malachi");
  if (bookLower.endsWith("matt")) return b.replace(/matt/i, "Matthew");
  if (bookLower.endsWith("rom")) return b.replace(/rom/i, "Romans");
  if (bookLower.endsWith("cor")) return b.replace(/cor/i, "Corinthians");
  if (bookLower.endsWith("gal")) return b.replace(/gal/i, "Galatians");
  if (bookLower.endsWith("eph")) return b.replace(/eph/i, "Ephesians");
  if (bookLower.endsWith("phil")) return b.replace(/phil/i, "Philippians");
  if (bookLower.endsWith("col")) return b.replace(/col/i, "Colossians");
  if (bookLower.endsWith("thess")) return b.replace(/thess/i, "Thessalonians");
  if (bookLower.endsWith("tim")) return b.replace(/tim/i, "Timothy");
  if (bookLower.endsWith("philem")) return b.replace(/philem/i, "Philemon");
  if (bookLower.endsWith("heb")) return b.replace(/heb/i, "Hebrews");
  if (bookLower.endsWith("jas")) return b.replace(/jas/i, "James");
  if (bookLower.endsWith("pet")) return b.replace(/pet/i, "Peter");
  if (bookLower.endsWith("rev")) return b.replace(/rev/i, "Revelation");
  
  if (b.toLowerCase() === "psalms") {
    b = "Psalm";
  }
  return b;
}

function verbalizeScripture(text: string): string {
  if (!text) return text;

  const BOOK_MATCH_LIST = [
    "Genesis", "Gen", "Exodus", "Ex", "Leviticus", "Lev", "Numbers", "Num", "Deuteronomy", "Deut",
    "Joshua", "Josh", "Judges", "Judg", "Ruth",
    "Samuel", "Sam", "Kings", "Chronicles", "Chron", "Ezra", "Nehemiah", "Neh", "Esther", "Esth", "Job",
    "Psalms", "Psalm", "Psa", "Proverbs", "Prov", "Ecclesiastes", "Eccl", "Song of Solomon", "Song",
    "Isaiah", "Isa", "Jeremiah", "Jer", "Lamentations", "Lam", "Ezekiel", "Eze", "Daniel", "Dan",
    "Hosea", "Hos", "Joel", "Amos", "Obadiah", "Obad", "Jonah", "Micah", "Mic", "Nahum", "Nah",
    "Habakkuk", "Hab", "Zephaniah", "Zeph", "Haggai", "Hag", "Zechariah", "Zech", "Malachi", "Mal",
    "Matthew", "Matt", "Mark", "Luke", "John", "Acts", "Romans", "Rom",
    "Corinthians", "Cor", "Galatians", "Gal", "Ephesians", "Eph", "Philippians", "Phil", "Colossians", "Col",
    "Thessalonians", "Thess", "Timothy", "Tim", "Titus", "Philemon", "Philem", "Hebrews", "Heb", "James", "Jas",
    "Peter", "Pet", "Jude", "Revelation", "Rev"
  ];

  const sortedBookMatchList = [...BOOK_MATCH_LIST].sort((a, b) => b.length - a.length);
  const bookPatternStr = `(?:(?:[123]|I{1,3}|First|Second|Third|first|second|third)\\s+)?(?:${sortedBookMatchList.map(b => b.replace(".", "\\.")).join("|")})`;

  let result = text;

  const getPrefixAndBook = (bookStr: string) => {
    const vBook = verbalizeBook(bookStr);
    const hasOrdinal = vBook.startsWith("First ") || vBook.startsWith("Second ") || vBook.startsWith("Third ");
    return { vBook, hasOrdinal };
  };

  const p1 = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\s*:\\s*(\\d+)\\s*[-—–]\\s*(\\d+)\\s*:\\s*(\\d+)\\b`, 'gi');
  result = result.replace(p1, (match, book, c1, v1, c2, v2) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const ch1 = numberToWords(parseInt(c1));
    const vr1 = numberToWords(parseInt(v1));
    const ch2 = numberToWords(parseInt(c2));
    const vr2 = numberToWords(parseInt(v2));
    
    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapter ${ch1}, verse ${vr1} through chapter ${ch2}, verse ${vr2}`;
  });

  const p2 = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\s*:\\s*(\\d+)\\s*[-—–]\\s*(\\d+)\\b`, 'gi');
  result = result.replace(p2, (match, book, c, v1, v2) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const ch = numberToWords(parseInt(c));
    const vr1 = numberToWords(parseInt(v1));
    const vr2 = numberToWords(parseInt(v2));

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `${vBook} ${ch}, verses ${vr1} through ${vr2}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapter ${ch}, verses ${vr1} through ${vr2}`;
  });

  const p3 = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\s*:\\s*(\\d+)\\b`, 'gi');
  result = result.replace(p3, (match, book, c, v) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const ch = numberToWords(parseInt(c));
    const vr = numberToWords(parseInt(v));

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `${vBook} ${ch}, verse ${vr}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapter ${ch}, verse ${vr}`;
  });

  const p4 = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\s*[-—–]\\s*(\\d+)\\b`, 'gi');
  result = result.replace(p4, (match, book, num1, num2) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const n1 = numberToWords(parseInt(num1));
    const n2 = numberToWords(parseInt(num2));

    if (isSingleChapterBook(vBook)) {
      return `${vBook} verses ${n1} through ${n2}`;
    }

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `Psalm ${n1} through ${n2}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapters ${n1} through ${n2}`;
  });

  const p5 = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\b`, 'gi');
  result = result.replace(p5, (match, book, num) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const n = numberToWords(parseInt(num));

    if (isSingleChapterBook(vBook)) {
      return `${vBook} verse ${n}`;
    }

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `${vBook} ${n}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapter ${n}`;
  });

  return result;
}

export default function App() {
  const { startTour, locale, setLocale } = useTour();

  // Lists and selection
  const [devotionals, setDevotionals] = useState<Devotional[]>(dailyDevotionals);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return localStorage.getItem("egw_selected_devotional_id");
  });
  const [bookReadHistory, setBookReadHistory] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("egw_book_read_history");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const isBookReadToday = (bookId: string): boolean => {
    const val = bookReadHistory[bookId];
    if (!val) return false;
    const dateObj = typeof val === 'number' ? new Date(val) : new Date(Number(val) || val);
    if (isNaN(dateObj.getTime())) return false;
    return getLocalDateString(dateObj) === getLocalDateString(new Date());
  };

  // Derived sorted list: selected book on the left, remaining sorted by MRU (most recently used)
  const sortedDevotionals = useMemo(() => {
    if (devotionals.length === 0) return [];
    
    const selectedBook = selectedId ? devotionals.find(b => b.id === selectedId) : null;
    const remainingBooks = selectedId ? devotionals.filter(b => b.id !== selectedId) : [...devotionals];
    
    // Explicit desired order of unread books as requested by the user
    const UNREAD_BOOKS_ORDER = [
      "blj", // To Be Like Jesus
      "flb", // The Faith I Live By
      "mar", // Maranatha
      "yrp", // Ye Shall Receive Power
      "wgd", // With God at Dawn
      "tmk", // That I May Know Him
      "sd",  // Sons and Daughters of God
      "ohc", // Our High Calling
      "cc",  // Conflict and Courage
      "ag",  // God's Amazing Grace
      "lhu", // Lift Him Up
      "rc",  // Reflecting Christ
      "mlt", // My Life Today
      "hp",  // In Heavenly Places
      "jnn", // Jesus, Name Above All Names
      "rre", // Radiant Religion
      "tdg", // This Day with God
      "ul",  // The Upward Look
      "ofc", // Our Father Cares
      "ctr", // Christ Triumphant
      "fh",  // From the Heart
      "hb"   // Homeward Bound
    ];

    // Sort remaining by most recently used (descending timestamp, with unread books at the end)
    remainingBooks.sort((a, b) => {
      const timeA = bookReadHistory[a.id] || 0;
      const timeB = bookReadHistory[b.id] || 0;
      
      if (timeA > 0 && timeB > 0) {
        return timeB - timeA; // Descending order: more recent read comes first
      }
      if (timeA > 0) return -1; // A is read, B is not. A comes first.
      if (timeB > 0) return 1;  // B is read, A is not. B comes first.
      
      // Both are unread, sort by the requested list order
      const indexA = UNREAD_BOOKS_ORDER.indexOf(a.id);
      const indexB = UNREAD_BOOKS_ORDER.indexOf(b.id);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.title.localeCompare(b.title);
    });
    
    if (selectedBook) {
      return [selectedBook, ...remainingBooks];
    }
    return remainingBooks;
  }, [devotionals, selectedId, bookReadHistory]);

  const selectedIdx = selectedId !== null && sortedDevotionals.length > 0
    ? sortedDevotionals.findIndex(d => d.id === selectedId)
    : null;

  const handleSelectBook = (idx: number | null) => {
    if (idx === null) {
      setSelectedId(null);
      localStorage.removeItem("egw_selected_devotional_id");
      return;
    }
    const clickedBook = sortedDevotionals[idx];
    if (clickedBook) {
      setSelectedId(clickedBook.id);
      localStorage.setItem("egw_selected_devotional_id", clickedBook.id);
    }
  };
  const [showCarousel, setShowCarousel] = useState<boolean>(() => {
    const savedSelectedId = localStorage.getItem("egw_selected_devotional_id");
    return savedSelectedId ? false : true;
  });
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeSource, setScrapeSource] = useState<string>("local");

  // Active Devotional Content
  const [content, setContent] = useState<DevotionalContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Paraphrasing Style Switcher State
  const [selectedProfile, setSelectedProfile] = useState<string>(() => {
    return localStorage.getItem("egw_selected_profile") || "clear_modern";
  });

  // Audio Playback / TTS State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeParagraphIdx, setActiveParagraphIdx] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // Calendar / Devotional Date State
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(() => new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState<number>(() => new Date().getMonth());
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  const openDatePicker = () => {
    setPickerYear(selectedDate.getFullYear());
    setPickerMonth(selectedDate.getMonth());
    setShowDatePicker(prev => !prev);
  };

  // Appearance
  const [theme, setTheme] = useState<"cream" | "slate">("slate");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Spiritual Streak State
  const [streakCount, setStreakCount] = useState<number>(() => {
    const storedStreak = localStorage.getItem("egw_streak_count");
    const storedLastReadDate = localStorage.getItem("egw_last_read_date");
    if (storedStreak && storedLastReadDate) {
      const streak = parseInt(storedStreak, 10) || 0;
      const todayStr = getLocalDateString(new Date());
      const lastRead = new Date(storedLastReadDate + "T00:00:00");
      const today = new Date(todayStr + "T00:00:00");
      
      const diffTime = today.getTime() - lastRead.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (todayStr === storedLastReadDate || diffDays === 1) {
        return streak;
      }
    }
    return 0;
  });

  const [lastReadDate, setLastReadDate] = useState<string>(() => {
    return localStorage.getItem("egw_last_read_date") || "";
  });

  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(() => {
    const todayStr = getLocalDateString(new Date());
    const storedLastReadDate = localStorage.getItem("egw_last_read_date");
    return todayStr === storedLastReadDate;
  });

  // PWA & Connectivity State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  });
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("Daily Devotionals Reader PWA Installation:\n\n• On Desktop / Android (Chrome, Edge): Click the Install icon in your browser address bar.\n• On iOS (Safari): Tap the Share icon, then select 'Add to Home Screen'.");
    }
  };

  // Offline Pre-cache Engine State
  const [cacheProgress, setCacheProgress] = useState<{
    active: boolean;
    title: string;
    current: number;
    total: number;
    isComplete?: boolean;
    error?: string;
  }>({
    active: false,
    title: "",
    current: 0,
    total: 0
  });

  const cancelCacheRef = useRef<boolean>(false);

  const handleCancelCache = () => {
    cancelCacheRef.current = true;
  };

  // Helper to pre-cache a specific month for a book
  const handlePreCacheMonth = async (year: number, monthIndex: number, bookIdOverride?: string) => {
    const targetBookId = bookIdOverride || selectedId || (sortedDevotionals.length > 0 ? sortedDevotionals[0].id : null);
    if (!targetBookId) return;

    const bookObj = devotionals.find(b => b.id === targetBookId);
    if (!bookObj) return;

    const monthName = new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    cancelCacheRef.current = false;
    setCacheProgress({
      active: true,
      title: `Pre-caching ${monthName} for "${bookObj.title}"`,
      current: 0,
      total: daysInMonth,
      isComplete: false
    });

    let completed = 0;
    const batchSize = 3;

    for (let i = 1; i <= daysInMonth; i += batchSize) {
      if (cancelCacheRef.current) break;

      const batch: Promise<any>[] = [];
      for (let b = 0; b < batchSize && (i + b) <= daysInMonth; b++) {
        const day = i + b;
        const targetDate = new Date(year, monthIndex, day);
        const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
        const dd = String(targetDate.getDate()).padStart(2, "0");
        const dateSuffix = `${mm}_${dd}/`;
        const dayParam = `${mm}_${dd}`;

        let baseLink = bookObj.link;
        if (!baseLink.endsWith("/")) baseLink += "/";
        const dateSpecificUrl = `${baseLink}${dateSuffix}`;
        const fetchUrl = `/api/fetch-devotional?url=${encodeURIComponent(dateSpecificUrl)}&profile=${selectedProfile}&book_id=${bookObj.id}&day=${dayParam}`;

        batch.push(
          fetch(fetchUrl)
            .then(() => {
              completed++;
              setCacheProgress(prev => ({ ...prev, current: Math.min(completed, daysInMonth) }));
            })
            .catch(err => console.warn(`Failed caching ${dateSuffix}:`, err))
        );
      }

      await Promise.all(batch);
    }

    if (!cancelCacheRef.current) {
      setCacheProgress(prev => ({ ...prev, current: daysInMonth, isComplete: true }));
      setTimeout(() => {
        setCacheProgress({ active: false, title: "", current: 0, total: 0 });
      }, 3500);
    } else {
      setCacheProgress({ active: false, title: "", current: 0, total: 0 });
    }
  };

  // Helper to pre-cache an entire book (365 days)
  const handlePreCacheBook = async (bookIdOverride?: string) => {
    const targetBookId = bookIdOverride || selectedId || (sortedDevotionals.length > 0 ? sortedDevotionals[0].id : null);
    if (!targetBookId) return;

    const bookObj = devotionals.find(b => b.id === targetBookId);
    if (!bookObj) return;

    const sampleYear = new Date().getFullYear();
    const dates: Date[] = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(sampleYear, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        dates.push(new Date(sampleYear, m, d));
      }
    }

    const totalDays = dates.length;
    cancelCacheRef.current = false;
    setCacheProgress({
      active: true,
      title: `Downloading "${bookObj.title}" for Offline (365 Days)`,
      current: 0,
      total: totalDays,
      isComplete: false
    });

    let completed = 0;
    const batchSize = 4;

    for (let i = 0; i < dates.length; i += batchSize) {
      if (cancelCacheRef.current) break;

      const batch: Promise<any>[] = [];
      for (let b = 0; b < batchSize && (i + b) < dates.length; b++) {
        const targetDate = dates[i + b];
        const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
        const dd = String(targetDate.getDate()).padStart(2, "0");
        const dateSuffix = `${mm}_${dd}/`;
        const dayParam = `${mm}_${dd}`;

        let baseLink = bookObj.link;
        if (!baseLink.endsWith("/")) baseLink += "/";
        const dateSpecificUrl = `${baseLink}${dateSuffix}`;
        const fetchUrl = `/api/fetch-devotional?url=${encodeURIComponent(dateSpecificUrl)}&profile=${selectedProfile}&book_id=${bookObj.id}&day=${dayParam}`;

        batch.push(
          fetch(fetchUrl)
            .then(() => {
              completed++;
              setCacheProgress(prev => ({ ...prev, current: Math.min(completed, totalDays) }));
            })
            .catch(err => console.warn(`Failed caching ${dateSuffix}:`, err))
        );
      }

      await Promise.all(batch);
    }

    if (!cancelCacheRef.current) {
      setCacheProgress(prev => ({ ...prev, current: totalDays, isComplete: true }));
      setTimeout(() => {
        setCacheProgress({ active: false, title: "", current: 0, total: 0 });
      }, 4000);
    } else {
      setCacheProgress({ active: false, title: "", current: 0, total: 0 });
    }
  };

  // Action to complete reading for today and advance streak
  const completeDailyReading = () => {
    const todayStr = getLocalDateString(new Date());

    // Flag the currently selected book as read/used
    if (selectedId) {
      const updatedHistory = {
        ...bookReadHistory,
        [selectedId]: Date.now()
      };
      setBookReadHistory(updatedHistory);
      localStorage.setItem("egw_book_read_history", JSON.stringify(updatedHistory));
    }

    if (hasCompletedToday) return;

    let newStreak = 1;
    if (lastReadDate) {
      const lastRead = new Date(lastReadDate + "T00:00:00");
      const today = new Date(todayStr + "T00:00:00");
      const diffTime = today.getTime() - lastRead.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = streakCount + 1;
      } else if (diffDays === 0) {
        newStreak = streakCount;
      }
    }

    setStreakCount(newStreak);
    setLastReadDate(todayStr);
    setHasCompletedToday(true);

    localStorage.setItem("egw_streak_count", String(newStreak));
    localStorage.setItem("egw_last_read_date", todayStr);
  };

  // Real-time clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refs for tracking active elements and speechSynthesis
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const paragraphRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const devotionalCacheRef = useRef<{
    book: string;
    date: string;
    profile: string;
    data: DevotionalContent;
  } | null>(null);

  // Load devotionals and check localStorage
  useEffect(() => {
    const savedSelectedId = localStorage.getItem("egw_selected_devotional_id");
    const savedTheme = localStorage.getItem("egw_theme");

    if (savedTheme) {
      setTheme(savedTheme as "cream" | "slate");
    }

    // Always use the updated static list of devotionals
    setDevotionals(dailyDevotionals);
    setScrapeSource("local");
    
    if (savedSelectedId) {
      const exists = dailyDevotionals.some(d => d.id === savedSelectedId);
      if (exists) {
        setSelectedId(savedSelectedId);
        setShowCarousel(false);
      } else {
        setSelectedId(null);
        setShowCarousel(true);
      }
    } else {
      setSelectedId(null);
      setShowCarousel(true);
      // Fetch list dynamically just in case we have a service sync
      fetchDevotionals();
    }
  }, []);

  // Function to apply voice config settings for a specific profile style
  const applyProfileVoiceSettings = (profile: string, availableVoices: SpeechSynthesisVoice[] = voices) => {
    const config = PROFILE_VOICE_CONFIGS[profile] || PROFILE_VOICE_CONFIGS.clear_modern;
    setSpeechRate(config.rate);
    setSpeechPitch(config.pitch);

    if (availableVoices.length > 0) {
      // Find a matching voice
      const engVoices = availableVoices.filter(v => v.lang.startsWith("en"));
      const searchPool = engVoices.length > 0 ? engVoices : availableVoices;

      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (config.genderPref === "male") {
        // Find standard male voice keywords
        matchedVoice = searchPool.find(v => 
          v.name.toLowerCase().includes("male") || 
          v.name.toLowerCase().includes("david") || 
          v.name.toLowerCase().includes("mark") || 
          v.name.toLowerCase().includes("george") || 
          v.name.toLowerCase().includes("daniel") || 
          v.name.toLowerCase().includes("ravi")
        );
      } else if (config.genderPref === "female") {
        // Find standard female voice keywords
        matchedVoice = searchPool.find(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("zira") || 
          v.name.toLowerCase().includes("samantha") || 
          v.name.toLowerCase().includes("hazel") || 
          v.name.toLowerCase().includes("susan") || 
          v.name.toLowerCase().includes("natural")
        );
      }

      // Fallback: natural voice, or en-US, or first available voice
      if (!matchedVoice) {
        matchedVoice = searchPool.find(v => v.name.toLowerCase().includes("natural")) ||
                       searchPool.find(v => v.lang.startsWith("en-US")) ||
                       searchPool.find(v => v.lang.startsWith("en")) ||
                       searchPool[0];
      }

      if (matchedVoice) {
        setSelectedVoiceName(matchedVoice.name);
      }
    }
  };

  // Sync selected book, profile, and selectedDate to localStorage and fetch content
  useEffect(() => {
    if (selectedId !== null) {
      const activeBook = sortedDevotionals.find(d => d.id === selectedId);
      if (activeBook) {
        localStorage.setItem("egw_selected_devotional_id", selectedId);
        localStorage.setItem("egw_selected_profile", selectedProfile);
        fetchActiveDevotionalContent(activeBook, selectedProfile, selectedDate);
        // Reset speech when book, profile, or date changes
        stopSpeech();
      }
    }
  }, [selectedId, selectedProfile, devotionals, selectedDate]);

  // Load available speech voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for major English voices or natural ones
      const filtered = availableVoices.filter(v => v.lang.startsWith("en"));
      const finalVoices = filtered.length > 0 ? filtered : availableVoices;
      setVoices(finalVoices);
      
      const currentProfile = localStorage.getItem("egw_selected_profile") || "clear_modern";
      applyProfileVoiceSettings(currentProfile, finalVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle active paragraph auto-scrolling
  useEffect(() => {
    if (activeParagraphIdx !== -1 && content && content.paragraphs[activeParagraphIdx]) {
      const activeId = content.paragraphs[activeParagraphIdx].id;
      const element = paragraphRefs.current[activeId];
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  }, [activeParagraphIdx, content]);

  // Handle active book auto-scrolling in the carousel
  useEffect(() => {
    if (showCarousel && selectedIdx !== null && sortedDevotionals.length > 0 && sortedDevotionals[selectedIdx]) {
      const activeBookId = sortedDevotionals[selectedIdx].id;
      const timer = setTimeout(() => {
        const element = document.getElementById(`carousel-item-${activeBookId}`);
        if (element && carouselContainerRef.current) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedIdx, sortedDevotionals, showCarousel]);

  // Fetch the book listings from Express scraper
  const fetchDevotionals = async () => {
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-devotionals");
      const result = await res.json();
      if (result.success && result.data) {
        setDevotionals(result.data);
        setScrapeSource(result.source);
        localStorage.setItem("egw_devotionals_list", JSON.stringify(result.data));
        
        // Restore selection if matching
        const savedSelectedId = localStorage.getItem("egw_selected_devotional_id");
        if (savedSelectedId) {
          const exists = result.data.some((d: Devotional) => d.id === savedSelectedId);
          if (exists) {
            setSelectedId(savedSelectedId);
            setShowCarousel(false);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching devotionals:", err);
    } finally {
      setIsScraping(false);
    }
  };

  // Fetch content for the selected devotional
  const fetchActiveDevotionalContent = async (
    devotional: Devotional, 
    profileStyle: string = selectedProfile,
    targetDate: Date = selectedDate
  ) => {
    // Use target date to build the correct month and day suffix
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateSuffix = `${month}_${day}/`;
    const dayParam = `${month}_${day}`;

    // Check if the same book (by id), date, and profile are in cache
    if (
      devotionalCacheRef.current &&
      devotionalCacheRef.current.book === devotional.id &&
      devotionalCacheRef.current.date === dateSuffix &&
      devotionalCacheRef.current.profile === profileStyle
    ) {
      console.log("Serving devotional from client-side cache:", devotional.id, dateSuffix, profileStyle);
      setContent(devotionalCacheRef.current.data);
      setContentError(null);
      setIsLoadingContent(false);
      return;
    }

    setIsLoadingContent(true);
    setContentError(null);
    setContent(null);
    try {
      let baseLink = devotional.link;
      if (!baseLink.endsWith("/")) {
        baseLink += "/";
      }
      const dateSpecificUrl = `${baseLink}${dateSuffix}`;

      const res = await fetch(`/api/fetch-devotional?url=${encodeURIComponent(dateSpecificUrl)}&profile=${profileStyle}&book_id=${devotional.id}&day=${dayParam}`);
      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }
      const data = await res.json();

      // Log pronunciation overrides to browser console
      if (data && Array.isArray(data.paragraphs)) {
        data.paragraphs.forEach((p: any) => {
          if (p.pronunciationOverrides && p.pronunciationOverrides.length > 0) {
            console.log(`%c[Pronunciation Overrides for paragraph ${p.id}]:`, 'color: #0d9488; font-weight: bold;', p.pronunciationOverrides);
          }
        });
      }

      // Cache the retrieved devotional content
      devotionalCacheRef.current = {
        book: devotional.id,
        date: dateSuffix,
        profile: profileStyle,
        data: data
      };

      setContent(data);
    } catch (err: any) {
      console.error("Error fetching content:", err);
      setContentError(err.message || "Failed to load the devotional reading for today. Please try again.");
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Scroll carousel into center
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselContainerRef.current) {
      const scrollAmt = carouselContainerRef.current.clientWidth * 0.6;
      carouselContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === "cream" ? "slate" : "cream";
    setTheme(nextTheme);
    localStorage.setItem("egw_theme", nextTheme);
  };

  // Speak a specific paragraph index
  const speakParagraph = (idx: number) => {
    if (!content || idx < 0 || idx >= content.paragraphs.length) {
      stopSpeech();
      return;
    }

    // Detach callbacks on previous utterance so cancel() doesn't trigger stale onend/onerror handlers
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();

    setActiveParagraphIdx(idx);
    setIsPlaying(true);
    setIsPaused(false);

    const block = content.paragraphs[idx];
    if (!block) return;
    let speechText = block.text || "";

    // Normalize em-dashes and en-dashes so TTS engine doesn't stutter or drop text
    speechText = speechText.replace(/—/g, ", ").replace(/–/g, " - ");

    // Apply pronunciation overrides if present
    if (block.pronunciationOverrides && Array.isArray(block.pronunciationOverrides) && block.pronunciationOverrides.length > 0) {
      console.log(`%c[Speaking paragraph ${block.id}] Applying pronunciation overrides:`, 'color: #ea580c; font-weight: bold;', block.pronunciationOverrides);
      const originalText = speechText;
      for (const override of block.pronunciationOverrides) {
        const replacement = PRONUNCIATION_REPLACEMENTS[override.token];
        if (replacement) {
          speechText = replaceNthWord(speechText, override.text, override.occurrence, replacement);
        }
      }
      console.log(`%c[Original text]:`, 'color: #71717a;', originalText);
      console.log(`%c[Modified phonetic text for TTS]:`, 'color: #0284c7; font-weight: bold;', speechText);
    }

    // If it's the first paragraph, optionally announce the title
    if (idx === 0) {
      speechText = `${content.title}. ${speechText}`;
    }

    // Convert scripture references into naturally spoken text
    speechText = verbalizeScripture(speechText);

    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;

    // Apply voice settings
    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onend = () => {
      // Advance to next paragraph
      if (idx + 1 < content.paragraphs.length) {
        speakParagraph(idx + 1);
      } else {
        stopSpeech();
        completeDailyReading();
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis error:", e);
      if (e.error !== "interrupted" && e.error !== "canceled") {
        stopSpeech();
      }
    };

    // Short 30ms delay prevents browser Web Speech API race conditions after cancel()
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 30);
  };

  const startSpeech = () => {
    if (!content) return;
    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      // Start from highlighted paragraph, or 0 if none is highlighted
      const startIdx = activeParagraphIdx !== -1 ? activeParagraphIdx : 0;
      speakParagraph(startIdx);
    }
  };

  const pauseSpeech = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const stopSpeech = () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveParagraphIdx(-1);
    utteranceRef.current = null;
  };

  const skipForward = () => {
    if (!content) return;
    const nextIdx = activeParagraphIdx + 1;
    if (nextIdx < content.paragraphs.length) {
      speakParagraph(nextIdx);
    }
  };

  const skipBackward = () => {
    if (!content) return;
    const prevIdx = activeParagraphIdx - 1;
    if (prevIdx >= 0) {
      speakParagraph(prevIdx);
    }
  };

  // Check which theme styles to apply
  const isSlate = theme === "slate";
  
  const bgStyle = isSlate 
    ? "bg-[#020617] text-slate-100 font-sans" 
    : "bg-[#FAF7F2] text-[#2E2B27] font-sans";
    
  const cardBgStyle = isSlate 
    ? "glass-panel shadow-2xl rounded-3xl" 
    : "bg-[#FFFDF9] border-[#E8E1D5] border shadow-sm rounded-3xl";

  const subTextStyle = isSlate
    ? "text-slate-400 font-sans"
    : "text-[#6E665A]";

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  return (
    <div 
      id="app-root" 
      className={`min-h-screen w-full flex relative overflow-hidden transition-colors duration-500 ${bgStyle}`}
      style={isSlate ? { background: "radial-gradient(circle at 50% 10%, #0f172a 0%, #020617 100%)" } : undefined}
    >
      {/* 1. Immersive Atmosphere Cosmic Glows */}
      {isSlate && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] atmosphere-cyan pointer-events-none z-0"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] atmosphere-amber pointer-events-none z-0"></div>
        </>
      )}

      {/* 2. Interactive Navigation Sidebar */}
      <aside 
        id="sidebar-nav" 
        className={`hidden md:flex flex-col items-center justify-between w-20 py-8 z-20 shrink-0 h-screen sticky top-0 border-r ${
          isSlate 
            ? "bg-[#080c14]/80 backdrop-blur-3xl border-white/5" 
            : "bg-[#f4ebd9]/90 backdrop-blur-2xl border-amber-900/10"
        }`}
      >
        <div className="flex flex-col items-center space-y-10">
          {/* Hexagonal branding emblem with soft shadow glow */}
          <div 
            id="sidebar-logo"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isSlate 
                ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                : "bg-gradient-to-br from-amber-600 to-amber-800 shadow-md"
            }`}
          >
            <span className="text-white font-serif font-bold text-lg">⬡</span>
          </div>

          {/* Sidebar controls */}
          <nav className="flex flex-col space-y-4">
            <button 
              id="nav-reader"
              onClick={() => {
                document.getElementById("reading-pane")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isSlate 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]" 
                  : "bg-amber-600/10 text-amber-800 border border-amber-600/20"
              }`}
              title="Focus Reading Pane"
            >
              <BookOpen size={18} />
            </button>

            <button 
              id="nav-voice"
              onClick={() => {
                const sel = document.getElementById("voice-select");
                if (sel) {
                  sel.focus();
                  sel.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isSlate 
                  ? "text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5" 
                  : "text-[#6E665A] hover:text-amber-800 hover:bg-amber-600/5"
              }`}
              title="Voice Presets"
            >
              <Volume2 size={18} />
            </button>

            <button 
              id="nav-stats"
              onClick={() => {
                alert("Let this divine system record your daily path of spiritual focus! ⚡");
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isSlate 
                  ? "text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5" 
                  : "text-[#6E665A] hover:text-amber-800 hover:bg-amber-600/5"
              }`}
              title="Telemetry Status"
            >
              <Award size={18} />
            </button>
          </nav>
        </div>

        {/* Bottom vertical labels */}
        <div className="flex flex-col items-center space-y-2">
          <div className={`text-[9px] font-mono tracking-widest uppercase origin-center rotate-90 my-4 ${isSlate ? "text-cyan-400/50" : "text-amber-800/50"}`}>
            {isSlate ? "AETHER" : "SYSTEM"}
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Frame */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative overflow-y-auto max-h-screen">
        
        {/* Header Ribbon with Real-Time HUD */}
        <header 
          id="app-header" 
          className={`px-3 sm:px-4 py-2 border-b transition-all relative z-30 ${
            isSlate 
              ? "bg-[#020617]/40 backdrop-blur-xl border-white/5" 
              : "bg-[#FAF7F2]/80 backdrop-blur-xl border-amber-900/5"
          }`}
        >
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 select-none">
            {/* Row 1: Title on Left + More Menu / Quick Actions on Right */}
            <div className="flex items-center justify-between w-full md:w-auto shrink-0 gap-2">
              <div className="flex items-center space-x-2 shrink-0">
                <div className="shrink-0">
                  <ProjectIcon size={26} className="rounded-xl shadow-lg border border-slate-700/50 hover:scale-105 transition-transform duration-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="font-display text-sm sm:text-base font-bold tracking-tight whitespace-nowrap">
                      {isSlate ? "Ellen G. White Devotionals" : "EGW Daily Devotionals"}
                    </h1>
                    {!isOnline && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        <WifiOff size={10} />
                        <span>Offline</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions (Desktop) / More Menu (Mobile/Narrow) */}
              <div className="flex items-center space-x-1 shrink-0">
                {/* Full Desktop Action Buttons */}
                <div className="hidden lg:flex items-center space-x-1">
                  <button
                    id="install-pwa-btn"
                    onClick={handleInstallPWA}
                    className={`p-1.5 px-2.5 rounded-lg border transition-all flex items-center space-x-1.5 text-xs font-mono font-bold cursor-pointer ${
                      isAppInstalled
                        ? isSlate
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                          : "bg-emerald-50 border-emerald-600/20 text-emerald-800"
                        : isSlate
                          ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 shadow-sm shadow-cyan-500/10"
                          : "bg-amber-100 border-amber-900/20 text-amber-900 hover:bg-amber-200"
                    }`}
                    title={isAppInstalled ? "PWA App Installed" : "Install PWA App"}
                  >
                    {isAppInstalled ? (
                      <>
                        <Check size={12} className="text-emerald-400 shrink-0" />
                        <span className="text-[10px]">INSTALLED</span>
                      </>
                    ) : (
                      <>
                        <Download size={12} className="shrink-0 animate-bounce" />
                        <span className="text-[10px]">INSTALL APP</span>
                      </>
                    )}
                  </button>

                  <button
                    id="download-book-btn"
                    onClick={() => handlePreCacheBook()}
                    disabled={cacheProgress.active}
                    className={`p-1.5 px-2.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-mono font-bold ${
                      cacheProgress.active
                        ? "opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400"
                        : isSlate 
                          ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50" 
                          : "bg-amber-100/90 border-amber-900/20 text-amber-900 hover:bg-amber-200"
                    }`}
                    title="Pre-cache all 365 daily devotionals for offline reading"
                  >
                    <Download size={12} className={cacheProgress.active ? "animate-spin text-cyan-400" : "text-cyan-400 shrink-0"} />
                    <span className="text-[10px]">OFFLINE BOOK</span>
                  </button>

                  <button
                    id="replay-tour-btn"
                    onClick={() => startTour("onboarding")}
                    className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-mono font-bold ${
                      isSlate 
                        ? "bg-slate-900/50 border-white/5 text-cyan-400 hover:bg-slate-800" 
                        : "bg-amber-50 border-amber-900/10 text-amber-800 hover:bg-amber-100"
                    }`}
                    title="Replay onboarding tour"
                  >
                    <Sparkles size={11} className="animate-pulse" />
                    <span className="hidden sm:inline text-[10px]">TOUR</span>
                  </button>

                  <button
                    id="theme-toggle"
                    onClick={toggleTheme}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSlate 
                        ? "bg-slate-900/50 border-white/5 text-amber-400 hover:bg-slate-800" 
                        : "bg-amber-50 border-amber-900/10 text-amber-800 hover:bg-amber-100"
                    }`}
                    title="Change preset theme"
                  >
                    {isSlate ? <Sun size={12} /> : <Moon size={12} />}
                  </button>
                </div>

                {/* More Menu Dropdown Toggle for Mobile / Narrow Views */}
                <div className="relative lg:hidden shrink-0">
                  <button
                    id="header-more-menu-btn"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-mono font-bold ${
                      isSlate 
                        ? "bg-slate-900/60 border-white/10 text-cyan-400 hover:bg-slate-800" 
                        : "bg-amber-100/80 border-amber-900/15 text-amber-900 hover:bg-amber-200"
                    }`}
                    title="More Options"
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {/* More Menu Popover */}
                  {showMoreMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
                        onClick={() => setShowMoreMenu(false)} 
                      />
                      <div 
                        className={`absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                          isSlate 
                            ? "bg-slate-950 border-cyan-500/30 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.9)]" 
                            : "bg-amber-50 border-amber-900/20 text-stone-800 shadow-[0_10px_35px_rgba(0,0,0,0.2)]"
                        }`}
                      >
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              handleInstallPWA();
                              setShowMoreMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                              isSlate ? "hover:bg-slate-800/80 text-cyan-300" : "hover:bg-amber-100 text-amber-900"
                            }`}
                          >
                            <Download size={13} className="text-cyan-400 shrink-0" />
                            <span>{isAppInstalled ? "App Installed" : "Install PWA App"}</span>
                          </button>

                          <button
                            onClick={() => {
                              handlePreCacheBook();
                              setShowMoreMenu(false);
                            }}
                            disabled={cacheProgress.active}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                              isSlate ? "hover:bg-slate-800/80 text-cyan-300" : "hover:bg-amber-100 text-amber-900"
                            }`}
                          >
                            <Download size={13} className="text-cyan-400 shrink-0" />
                            <span>Download Book (365 Days)</span>
                          </button>

                          <button
                            onClick={() => {
                              startTour("onboarding");
                              setShowMoreMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                              isSlate ? "hover:bg-slate-800/80 text-cyan-400" : "hover:bg-amber-100 text-amber-900"
                            }`}
                          >
                            <Sparkles size={13} className="text-amber-400 animate-pulse" />
                            <span>Replay Tour</span>
                          </button>

                          <button
                            onClick={() => {
                              toggleTheme();
                              setShowMoreMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                              isSlate ? "hover:bg-slate-800/80 text-amber-400" : "hover:bg-amber-100 text-amber-900"
                            }`}
                          >
                            {isSlate ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-amber-800" />}
                            <span>{isSlate ? "Light Amber Mode" : "Dark Slate Mode"}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: HUD Controls (Style, Streak Badge, Calendar Date Selector) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start sm:justify-end shrink-0 w-full md:w-auto py-0.5">
              {/* Reading Style Selection Dropdown */}
              <div className="flex items-center space-x-1 shrink-0">
                <span className={`hidden sm:inline text-[10px] font-mono uppercase font-bold ${isSlate ? "text-slate-400" : "text-[#6E665A]"}`}>Style:</span>
                <select
                  id="header-profile-switcher"
                  value={selectedProfile}
                  onChange={(e) => {
                    const newProfile = e.target.value;
                    setSelectedProfile(newProfile);
                    applyProfileVoiceSettings(newProfile);
                  }}
                  className={`text-xs rounded-xl border px-2 py-1 font-sans font-medium focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] truncate ${
                    isSlate 
                      ? "bg-slate-950 border-white/10 text-slate-200 focus:border-cyan-400" 
                      : "bg-white border-amber-900/15 text-stone-800 focus:border-amber-600"
                  }`}
                >
                  {DEVOTIONAL_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Spiritual Streak HUD Badge */}
              <div 
                id="header-streak-badge"
                className={`flex items-center space-x-1 px-2 py-1 rounded-2xl border font-mono transition-all duration-300 shrink-0 ${
                  hasCompletedToday
                    ? isSlate 
                      ? "bg-amber-500/10 border-amber-400/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                      : "bg-amber-100 border-amber-300 text-amber-900"
                    : isSlate 
                      ? "bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10" 
                      : "bg-stone-100 border-stone-200 text-stone-500"
                }`}
                title={hasCompletedToday ? "Spiritual Streak Active!" : "Read today's devotional to lock in your streak!"}
              >
                <Flame size={12} className={`transition-all duration-300 ${hasCompletedToday ? "animate-pulse fill-amber-400 text-amber-500" : "opacity-60"}`} />
                <div className="text-left leading-none">
                  <div className="text-xs font-bold flex items-baseline">
                    <span>{streakCount}</span>
                    <span className="text-[8px] ml-0.5 opacity-85 font-normal">DAYS</span>
                  </div>
                </div>
              </div>

              {/* Calendar Date Selector */}
              <div className="relative shrink-0" id="calendar-date-container">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      const prev = new Date(selectedDate);
                      prev.setDate(prev.getDate() - 1);
                      setSelectedDate(prev);
                    }}
                    className={`p-1 rounded-xl border transition-all ${
                      isSlate 
                        ? "bg-slate-900/50 border-white/5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800" 
                        : "bg-amber-50 border-amber-900/10 text-stone-700 hover:text-amber-800 hover:bg-amber-100"
                    }`}
                    title="Previous Day"
                  >
                    <ChevronLeft size={12} />
                  </button>

                  <button
                    id="header-calendar-button"
                    type="button"
                    onClick={openDatePicker}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl border text-xs font-mono font-medium transition-all ${
                      isSlate 
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.12)]" 
                        : "bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200/80"
                    }`}
                    title="Select Devotional Date"
                  >
                    <Calendar size={12} className="shrink-0 text-cyan-400" />
                    <span className="font-bold tracking-tight">{formatDateDisplay(selectedDate)}</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = new Date(selectedDate);
                      next.setDate(next.getDate() + 1);
                      setSelectedDate(next);
                    }}
                    className={`p-1 rounded-xl border transition-all ${
                      isSlate 
                        ? "bg-slate-900/50 border-white/5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800" 
                        : "bg-amber-50 border-amber-900/10 text-stone-700 hover:text-amber-800 hover:bg-amber-100"
                    }`}
                    title="Next Day"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>

                {/* Interactive Calendar Popover Modal */}
                {showDatePicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
                      onClick={() => setShowDatePicker(false)} 
                    />

                    <div 
                      className={`absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] p-3.5 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                        isSlate 
                          ? "bg-slate-950 border-cyan-500/30 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.9)]" 
                          : "bg-amber-50 border-amber-900/20 text-stone-800 shadow-[0_10px_35px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      {/* Calendar Popover Top Bar */}
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-700/30">
                        <div className="flex items-center space-x-1.5">
                          <Calendar size={13} className={isSlate ? "text-cyan-400" : "text-amber-800"} />
                          <span className="text-[11px] font-bold font-mono uppercase tracking-wider">
                            Select Date
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className={`p-1 rounded-lg transition-all ${
                            isSlate 
                              ? "hover:bg-slate-800 text-slate-400 hover:text-white" 
                              : "hover:bg-amber-200/60 text-stone-600 hover:text-stone-900"
                          }`}
                          title="Close Calendar"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Month & Year Navigation Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (pickerMonth === 0) {
                              setPickerMonth(11);
                              setPickerYear(y => y - 1);
                            } else {
                              setPickerMonth(m => m - 1);
                            }
                          }}
                          className={`p-1 rounded-lg border transition-all ${
                            isSlate ? "bg-slate-900 border-white/10 hover:border-cyan-400 text-slate-300" : "bg-white border-amber-900/20 hover:border-amber-600 text-stone-700"
                          }`}
                          title="Previous Month"
                        >
                          <ChevronLeft size={13} />
                        </button>

                        <div className="flex items-center space-x-1.5">
                          {/* Month Selector Dropdown */}
                          <select
                            value={pickerMonth}
                            onChange={(e) => setPickerMonth(Number(e.target.value))}
                            className={`text-xs font-bold font-mono px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                              isSlate ? "bg-slate-900 border-cyan-500/30 text-cyan-300" : "bg-white border-amber-900/20 text-amber-900"
                            }`}
                          >
                            {[
                              "January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"
                            ].map((mName, idx) => (
                              <option key={mName} value={idx}>{mName}</option>
                            ))}
                          </select>

                          {/* Year Selector Dropdown */}
                          <select
                            value={pickerYear}
                            onChange={(e) => setPickerYear(Number(e.target.value))}
                            className={`text-xs font-bold font-mono px-1.5 py-1 rounded-lg border outline-none cursor-pointer ${
                              isSlate ? "bg-slate-900 border-cyan-500/30 text-cyan-300" : "bg-white border-amber-900/20 text-amber-900"
                            }`}
                          >
                            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (pickerMonth === 11) {
                              setPickerMonth(0);
                              setPickerYear(y => y + 1);
                            } else {
                              setPickerMonth(m => m + 1);
                            }
                          }}
                          className={`p-1 rounded-lg border transition-all ${
                            isSlate ? "bg-slate-900 border-white/10 hover:border-cyan-400 text-slate-300" : "bg-white border-amber-900/20 hover:border-amber-600 text-stone-700"
                          }`}
                          title="Next Month"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>

                      {/* Weekday Header Labels */}
                      <div className="grid grid-cols-7 text-center mb-1 text-[10px] font-mono font-bold uppercase opacity-60">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                      </div>

                      {/* Calendar Days Grid */}
                      {(() => {
                        const firstDayIndex = new Date(pickerYear, pickerMonth, 1).getDay();
                        const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
                        const today = new Date();

                        return (
                          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                            {/* Empty padding slots before day 1 */}
                            {Array.from({ length: firstDayIndex }).map((_, i) => (
                              <div key={`empty-${i}`} className="h-7" />
                            ))}

                            {/* Day Cells */}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                              const isSelected = 
                                selectedDate.getFullYear() === pickerYear &&
                                selectedDate.getMonth() === pickerMonth &&
                                selectedDate.getDate() === day;

                              const isToday = 
                                today.getFullYear() === pickerYear &&
                                today.getMonth() === pickerMonth &&
                                today.getDate() === day;

                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(new Date(pickerYear, pickerMonth, day));
                                    setShowDatePicker(false);
                                  }}
                                  className={`h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative ${
                                    isSelected
                                      ? isSlate 
                                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20" 
                                        : "bg-amber-800 text-amber-50 font-bold shadow-md"
                                      : isSlate
                                        ? "hover:bg-cyan-500/20 text-slate-200"
                                        : "hover:bg-amber-200/60 text-stone-800"
                                  } ${isToday && !isSelected ? (isSlate ? "ring-1 ring-cyan-400/60 text-cyan-300 font-bold" : "ring-1 ring-amber-700 text-amber-900 font-bold") : ""}`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* Quick Action Footer */}
                      <div className="mt-3 pt-2 border-t border-slate-700/30 flex flex-col gap-1.5 text-[10px] font-mono">
                        <button
                          id="precache-month-btn"
                          type="button"
                          disabled={cacheProgress.active}
                          onClick={() => {
                            handlePreCacheMonth(pickerYear, pickerMonth);
                            setShowDatePicker(false);
                          }}
                          className={`w-full py-1.5 px-2 rounded-lg border font-bold text-center transition-all flex items-center justify-center space-x-1.5 ${
                            cacheProgress.active
                              ? "opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400"
                              : isSlate 
                                ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 shadow-sm" 
                                : "bg-amber-100 border-amber-900/20 text-amber-900 hover:bg-amber-200"
                          }`}
                        >
                          <Download size={11} className={cacheProgress.active ? "animate-spin text-cyan-400" : "text-cyan-400 shrink-0"} />
                          <span>Pre-cache {new Date(pickerYear, pickerMonth, 1).toLocaleString('en-US', { month: 'short' })} for Offline</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date();
                            setSelectedDate(today);
                            setPickerYear(today.getFullYear());
                            setPickerMonth(today.getMonth());
                            setShowDatePicker(false);
                          }}
                          className={`w-full py-1.5 rounded-lg border font-semibold text-center transition-all ${
                            isSlate 
                              ? "bg-slate-900 border-white/10 text-slate-300 hover:text-cyan-400 hover:bg-slate-800" 
                              : "bg-white border-amber-900/15 text-stone-700 hover:text-amber-900 hover:bg-amber-100/60"
                          }`}
                        >
                          📅 Reset to Today
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Live Offline Pre-cache Progress HUD Banner */}
        {cacheProgress.active && (
          <div 
            id="cache-progress-banner"
            className={`px-4 py-2 border-b text-xs font-mono transition-all z-20 animate-in slide-in-from-top-2 duration-200 ${
              isSlate 
                ? "bg-cyan-950/90 border-cyan-500/30 text-cyan-200 shadow-lg shadow-cyan-950/50" 
                : "bg-amber-100 border-amber-900/20 text-amber-950 shadow-md"
            }`}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Download size={14} className="animate-spin text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="font-bold">{cacheProgress.title}</span>
                  <span className="ml-2 text-[11px] opacity-80">
                    ({cacheProgress.current} / {cacheProgress.total} days)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {/* Progress Bar Track */}
                <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/10 shrink-0">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200 rounded-full"
                    style={{ width: `${Math.round((cacheProgress.current / Math.max(cacheProgress.total, 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold w-10 text-right">
                  {Math.round((cacheProgress.current / Math.max(cacheProgress.total, 1)) * 100)}%
                </span>
                
                {!cacheProgress.isComplete ? (
                  <button
                    onClick={handleCancelCache}
                    className="px-2 py-0.5 text-[10px] rounded border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 font-bold transition-all"
                  >
                    CANCEL
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center space-x-1">
                    <Check size={12} />
                    <span>DONE</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Carousel Area */}
        <section id="carousel-section" className={`px-4 py-4 border-b transition-all duration-300 ${isSlate ? "border-white/5 bg-slate-950/20" : "border-amber-900/5 bg-amber-50/20"}`}>
          <div className="max-w-6xl mx-auto">
            {showCarousel ? (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className={`text-[10px] font-bold uppercase tracking-widest font-mono ${isSlate ? "text-cyan-400" : "text-amber-800"}`}>
                      DEVOTIONAL LIBRARY
                    </h2>
                    <p className={`text-[10px] mt-0.5 hidden sm:block ${subTextStyle}`}>
                      Scroll and select a devotional book cover below to fetch today's entry.
                    </p>
                  </div>
                  
                  <div className="flex space-x-1.5">
                    <button
                      id="carousel-left"
                      onClick={() => scrollCarousel("left")}
                      disabled={sortedDevotionals.length <= 1}
                      className={`p-1.5 rounded-lg transition-all border ${
                        isSlate 
                          ? "bg-slate-900/40 hover:bg-slate-800 text-cyan-400 border-white/5 disabled:opacity-20" 
                          : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-900/10 disabled:opacity-25"
                      }`}
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      id="carousel-right"
                      onClick={() => scrollCarousel("right")}
                      disabled={sortedDevotionals.length <= 1}
                      className={`p-1.5 rounded-lg transition-all border ${
                        isSlate 
                          ? "bg-slate-900/40 hover:bg-slate-800 text-cyan-400 border-white/5 disabled:opacity-20" 
                          : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-900/10 disabled:opacity-25"
                      }`}
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Book Carousel Slider */}
                {isScraping && sortedDevotionals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <Loader2 className={`animate-spin ${isSlate ? "text-cyan-400" : "text-amber-600"}`} size={24} />
                    <p className="text-[10px] font-mono italic">Syncing with Ellen G. White Estate database...</p>
                  </div>
                ) : (
                  <div
                    id="carousel-viewport"
                    ref={carouselContainerRef}
                    className="flex overflow-x-auto space-x-4 py-2 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {sortedDevotionals.map((book, idx) => (
                      <div
                        key={book.id}
                        id={`carousel-item-${book.id}`}
                        onClick={() => {
                          handleSelectBook(idx);
                          setShowCarousel(false);
                        }}
                        className="flex-none w-28 sm:w-36 snap-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                      >
                        <div className="relative">
                          <BookCover
                            title={book.title}
                            coverUrl={book.cover}
                            active={idx === selectedIdx}
                            bookId={book.id}
                            isReadToday={isBookReadToday(book.id)}
                          />
                        </div>
                        <p className={`text-center text-[10px] mt-2 font-semibold truncate max-w-full px-1 ${isSlate ? "text-slate-200" : "text-stone-800"}`}>
                          {book.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Book Bento Banner - Hidden on mobile screens to prioritize vertical space */}
                {selectedIdx !== null && sortedDevotionals.length > 0 && sortedDevotionals[selectedIdx] && (
                  <div 
                    id="selected-book-details"
                    className={`mt-3 p-4 transition-all duration-300 hidden sm:block ${cardBgStyle}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-xl hidden md:block ${isSlate ? "bg-cyan-500/10 text-cyan-400" : "bg-amber-500/10 text-amber-800"}`}>
                        <Sparkles size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-display font-bold text-sm ${isSlate ? "text-cyan-300 text-glow-cyan" : "text-amber-800"}`}>
                            {sortedDevotionals[selectedIdx].title}
                          </span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${isSlate ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/10 text-amber-800"}`}>
                            ACTIVE CORE
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1 leading-relaxed font-sans ${subTextStyle}`}>
                          {sortedDevotionals[selectedIdx].description}
                        </p>
                        <a
                          href={sortedDevotionals[selectedIdx].link}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-[9px] font-mono tracking-wider hover:underline inline-flex items-center space-x-1 mt-2 ${
                            isSlate ? "text-cyan-400 font-bold" : "text-amber-800"
                          }`}
                        >
                          <span>RESOLVE METADATA URL</span>
                          <Sparkles size={8} />
                        </a>
                      </div>
                      
                      <div className={`text-[9px] px-2 py-1 font-mono rounded font-bold ${
                        isSlate ? "bg-slate-900 border border-white/5 text-cyan-400" : "bg-amber-100 text-amber-900"
                      }`}>
                        NODE://{sortedDevotionals[selectedIdx].id.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              selectedIdx !== null && sortedDevotionals[selectedIdx] && (
                <div className="flex flex-row gap-4 sm:gap-6 items-center py-2 animate-fade-in">
                  {/* Left Side: Selected Book Cover */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <div 
                      onClick={() => setShowCarousel(true)}
                      className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.04]"
                      title="Click book to show library carousel"
                    >
                      <div className="w-16 sm:w-24 md:w-28">
                        <BookCover
                          title={sortedDevotionals[selectedIdx].title}
                          coverUrl={sortedDevotionals[selectedIdx].cover}
                          active={true}
                          bookId={sortedDevotionals[selectedIdx].id}
                          isReadToday={isBookReadToday(sortedDevotionals[selectedIdx].id)}
                        />
                      </div>
                      {/* Subtle overlay hint */}
                      <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-1 text-center">
                        <BookOpen size={14} className="text-cyan-400 mb-0.5 animate-bounce" />
                        <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider">
                          Library
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCarousel(true)}
                      className={`mt-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider font-bold transition-colors flex items-center space-x-1 uppercase ${
                        isSlate ? "text-cyan-400/70 hover:text-cyan-400" : "text-amber-800/70 hover:text-amber-800"
                      }`}
                    >
                      <span>Change Book</span>
                    </button>

                    <button 
                      onClick={() => handlePreCacheBook(sortedDevotionals[selectedIdx].id)}
                      disabled={cacheProgress.active}
                      className={`mt-1 text-[8px] sm:text-[9px] font-mono font-bold transition-colors flex items-center space-x-1 ${
                        isSlate ? "text-cyan-300 hover:text-cyan-200" : "text-amber-900 hover:text-amber-950"
                      }`}
                      title="Pre-cache all 365 daily entries for offline reading"
                    >
                      <Download size={10} className="shrink-0 text-cyan-400" />
                      <span>Cache Offline</span>
                    </button>
                  </div>

                  {/* Right Side: Selected Book Details */}
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0 py-0.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-display font-bold text-xs sm:text-sm md:text-base truncate max-w-[200px] xs:max-w-[250px] sm:max-w-md ${isSlate ? "text-cyan-300 text-glow-cyan" : "text-amber-800"}`}>
                          {sortedDevotionals[selectedIdx].title}
                        </span>
                        <span className={`text-[7px] sm:text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${isSlate ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/10 text-amber-800"}`}>
                          ACTIVE BOOK
                        </span>
                      </div>
                      <p className={`text-[10px] sm:text-xs mt-1 leading-relaxed font-sans line-clamp-4 ${subTextStyle}`}>
                        {sortedDevotionals[selectedIdx].description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-dashed border-white/10">
                      <a
                        href={sortedDevotionals[selectedIdx].link}
                        target="EGWEstatePage"
                        rel="noreferrer"
                        className={`text-[8px] sm:text-[9px] font-mono tracking-wider hover:underline inline-flex items-center space-x-1 ${
                          isSlate ? "text-cyan-400 font-bold" : "text-amber-800"
                        }`}
                      >
                        <span>EGW ESTATE PAGE</span>
                        <Sparkles size={8} />
                      </a>

                      <div className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 font-mono rounded font-bold ${
                        isSlate ? "bg-slate-900 border border-white/5 text-cyan-400" : "bg-amber-100 text-amber-900"
                      }`}>
                        NODE://{sortedDevotionals[selectedIdx].id.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* 5. Main Devotional Scroll Frame */}
        <main id="reading-pane" className="flex-1 px-4 sm:px-6 py-6 md:py-10 max-w-3xl mx-auto w-full flex flex-col justify-between z-10">
          
          {isLoadingContent ? (
            <div id="loading-reading" className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className={`animate-spin ${isSlate ? "text-cyan-400" : "text-amber-600"}`} size={36} />
              <div className="text-center">
                <p className="font-display font-medium text-base">Initializing Devotional Stream...</p>
                <p className={`text-xs mt-1.5 font-mono ${subTextStyle}`}>Fetching: {sortedDevotionals[selectedIdx]?.title || "Ellen G. White Estate"}</p>
              </div>
            </div>
          ) : contentError ? (
            <div id="content-error-panel" className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-red-500/10 text-red-400 rounded-full mb-3">
                <Info size={32} />
              </div>
              <h4 className="font-display font-bold text-lg text-red-500">Node Sync Interrupted</h4>
              <p className="text-sm text-slate-400 mt-2 max-w-md">
                {contentError}
              </p>
              <button
                onClick={() => sortedDevotionals[selectedIdx] && fetchActiveDevotionalContent(sortedDevotionals[selectedIdx])}
                className={`mt-5 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                  isSlate 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white shadow-lg shadow-cyan-500/20" 
                    : "bg-amber-700 hover:bg-amber-800 text-white shadow-md"
                }`}
              >
                RE-INITIALIZE FEED
              </button>
            </div>
          ) : content ? (
            <article id="devotional-article" className="flex-1">
              {content.warning && (
                <div className={`mb-6 p-4 rounded-2xl border flex items-start space-x-3 text-xs leading-normal ${
                  isSlate 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300" 
                    : "bg-amber-50 border-amber-600/15 text-amber-950"
                }`}>
                  <Info size={16} className="shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                  <div>
                    <span className="font-bold">AI Translation Note:</span> {content.warning}
                  </div>
                </div>
              )}
              
              {/* Devotional Heading */}
              <header className="text-center mb-10 pb-8 border-b border-white/5">
                <h2 className={`font-display text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${isSlate ? "text-white" : "text-stone-950"}`}>
                  {content.title}
                </h2>
                <div className="mt-3 flex flex-col items-center justify-center gap-2 select-none">
                  {content.isFallback ? (
                    <span className={`text-[9px] font-mono tracking-wider uppercase font-bold px-3 py-1 rounded-full flex items-center space-x-1 ${
                      isSlate 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse" 
                        : "bg-amber-600/10 text-amber-800 border border-amber-600/25 animate-pulse"
                    }`}>
                      <Info size={10} className="mr-1 text-amber-500 shrink-0 animate-pulse" />
                      <span>Classic / Original</span>
                    </span>
                  ) : (
                    <span className={`text-[9px] font-mono tracking-wider uppercase font-bold px-3 py-1 rounded-full flex items-center space-x-1 ${
                      isSlate 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" 
                        : "bg-amber-600/10 text-amber-800 border border-amber-600/25"
                    }`}>
                      <Sparkles size={10} className="mr-1 animate-pulse" />
                      <span>
                        {DEVOTIONAL_PROFILES.find(p => p.id === selectedProfile)?.name || "Classic / Original"}
                      </span>
                    </span>
                  )}
                  {(() => {
                    const profile = DEVOTIONAL_PROFILES.find(p => p.id === (content.isFallback ? "classic" : selectedProfile));
                    if (!profile) return null;
                    return (
                      <p className={`text-[11px] sm:text-xs max-w-md text-center font-sans font-medium px-4 ${
                        isSlate ? "text-slate-300" : "text-stone-700"
                      }`}>
                        {content.isFallback 
                          ? "This reading was automatically loaded in the authentic classic style due to a temporary AI service limit or error." 
                          : profile.description}
                      </p>
                    );
                  })()}
                </div>
                <div className={`h-1 w-20 mx-auto mt-5 rounded-full ${isSlate ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_#22d3ee]" : "bg-amber-600"}`}></div>
              </header>

              {/* Devotional Content Blocks */}
              <div className="space-y-6 pb-28 font-serif text-base sm:text-[18px] leading-relaxed tracking-normal select-text">
                {content.paragraphs.map((block, idx) => {
                  const isActive = idx === activeParagraphIdx;
                  
                  if (block.type === "scripture") {
                    return (
                      <div
                        key={block.id}
                        ref={el => { paragraphRefs.current[block.id] = el; }}
                        onClick={() => speakParagraph(idx)}
                        className={`relative pl-5 pr-4 py-4 border-l-4 rounded-r-2xl cursor-pointer transition-all duration-300 ${
                          isActive 
                            ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] scale-[1.01]" 
                            : isSlate 
                              ? "border-cyan-500/20 bg-slate-900/30 hover:bg-cyan-500/5 hover:border-cyan-400/60"
                              : "border-amber-600/30 bg-black/[0.02] hover:bg-amber-500/5 hover:border-amber-600/50"
                        }`}
                      >
                        <p className={`italic font-medium leading-relaxed ${isSlate ? "text-cyan-300" : "text-amber-900"}`}>
                          {block.text}
                        </p>
                        {isActive && (
                          <div className="absolute right-3 top-3 flex items-center space-x-1 text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse uppercase">
                            <Volume2 size={8} />
                            <span>Active</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Standard paragraph block
                  return (
                    <div
                      key={block.id}
                      ref={el => { paragraphRefs.current[block.id] = el; }}
                      onClick={() => speakParagraph(idx)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? isSlate 
                            ? "bg-slate-800/40 shadow-xl border border-cyan-500/25 scale-[1.01]" 
                            : "bg-amber-500/10 shadow-sm border border-amber-500/15 scale-[1.01]"
                          : isSlate 
                            ? "hover:bg-white/[0.015] text-slate-200" 
                            : "hover:bg-black/[0.01] text-stone-800"
                      }`}
                    >
                      <p className="text-justify indent-5 leading-relaxed">
                        {block.text}
                      </p>
                      {isActive && (
                        <div className="flex justify-end mt-2">
                          <span className={`flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse uppercase ${
                            isSlate ? "bg-cyan-500/20 text-cyan-300" : "bg-amber-500/20 text-amber-800"
                          }`}>
                            <Volume2 size={8} />
                            <span>Reading Voice</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Daily Spiritual Completion Check-in Card */}
                <div 
                  id="streak-completion-card"
                  className={`mt-10 p-6 rounded-3xl border transition-all duration-300 ${
                    isSlate 
                      ? "bg-slate-900/40 border-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.03)]" 
                      : "bg-amber-50/50 border-amber-900/5 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className={`p-4 rounded-2xl flex items-center justify-center transition-transform duration-500 ${
                        hasCompletedToday 
                          ? isSlate 
                            ? "bg-amber-500/10 text-amber-400 rotate-12 scale-110" 
                            : "bg-amber-100 text-amber-800 rotate-12 scale-110"
                          : isSlate 
                            ? "bg-slate-950 text-slate-500" 
                            : "bg-stone-100 text-stone-400"
                      }`}>
                        <Flame size={28} className={hasCompletedToday ? "animate-pulse fill-amber-400 text-amber-500" : ""} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm leading-tight">
                          {hasCompletedToday ? "Reflection Streak Active!" : "Unlock Today's Reflection Streak"}
                        </h4>
                        <p className={`text-xs mt-1 max-w-sm ${subTextStyle}`}>
                          {hasCompletedToday 
                            ? `Stellar job! You have logged ${streakCount} consecutive days of spiritual wisdom reflection.`
                            : "Commit to your continuous growth by marking today's reading session as completed."}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2">
                      {selectedId && isBookReadToday(selectedId) ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                          <div className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center justify-center space-x-2 border w-full sm:w-auto ${
                            isSlate 
                              ? "bg-[#10b981]/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                              : "bg-emerald-600/10 border-emerald-600/20 text-emerald-800"
                          }`}>
                            <Check size={14} className="text-emerald-400 font-bold" />
                            <span>COMPLETED (READ TODAY)</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              const updatedHistory = { ...bookReadHistory };
                              delete updatedHistory[selectedId];
                              setBookReadHistory(updatedHistory);
                              localStorage.setItem("egw_book_read_history", JSON.stringify(updatedHistory));
                            }}
                            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer text-center ${
                              isSlate 
                                ? "bg-slate-950 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30" 
                                : "bg-white border-stone-200 text-stone-500 hover:text-rose-700 hover:border-rose-300"
                            }`}
                            title="Reset completed status for this book"
                          >
                            RESET STATUS
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={completeDailyReading}
                          className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-mono font-bold transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center space-x-2 ${
                            isSlate 
                              ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-white shadow-cyan-400/25 cursor-pointer" 
                              : "bg-amber-700 hover:bg-amber-800 text-white cursor-pointer"
                          }`}
                        >
                          <Check size={14} />
                          <span>MARK COMPLETED</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div id="no-content-state" className="flex-1 flex flex-col items-center justify-center py-16 text-center select-none animate-fade-in">
              <ProjectIcon size={96} className="mb-6 rounded-2xl shadow-2xl border border-slate-700/50 hover:scale-105 transition-transform duration-300" />
              <p className={`font-display text-base font-medium ${isSlate ? "text-slate-300" : "text-stone-850"}`}>
                No Devotional Selected
              </p>
              <p className={`text-xs mt-2 max-w-xs leading-relaxed ${subTextStyle}`}>
                Please select a devotional book from the library above to load today's daily reading.
              </p>
            </div>
          )}
        </main>

        {/* 6. Audio Control Console Anchored at Bottom */}
        <footer 
          id="audio-playback-dock"
          className={`fixed bottom-0 left-0 md:left-20 right-0 p-4 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] z-50 transition-all ${
            isSlate 
              ? "bg-slate-950/90 backdrop-blur-3xl border-t border-white/10" 
              : "bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-amber-900/10"
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-row items-center justify-between gap-2 md:gap-4 flex-nowrap overflow-x-auto no-scrollbar">
            
            {/* Left Column: Book Cover Image only */}
            <div className="flex items-center justify-center flex-shrink-0">
              <div className={`w-9 h-12 rounded-md overflow-hidden shadow-sm flex items-center justify-center border ${
                isSlate ? "bg-slate-900 border-white/10" : "bg-amber-50 border-amber-900/10"
              }`}>
                {selectedIdx !== null && sortedDevotionals[selectedIdx]?.cover ? (
                  <img 
                    src={sortedDevotionals[selectedIdx].cover} 
                    alt="cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-cyan-400 font-mono">
                    {(selectedIdx !== null ? sortedDevotionals[selectedIdx]?.id : "EGW")?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Middle Column: Player Controls */}
            <div className="flex flex-row items-center gap-2 sm:gap-4 flex-grow justify-center min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                {/* Skip back */}
                <button
                  id="btn-skip-backward"
                  onClick={skipBackward}
                  disabled={!content || activeParagraphIdx <= 0}
                  className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                    isSlate 
                      ? "bg-slate-900/40 border-white/5 text-cyan-400 hover:bg-slate-800 disabled:opacity-25" 
                      : "bg-amber-50 border-amber-900/5 text-amber-800 hover:bg-amber-100 disabled:opacity-25"
                  }`}
                  title="Previous paragraph"
                >
                  <SkipBack size={13} />
                </button>

                {/* Play / Pause Toggle with custom glow shadows */}
                {isPlaying ? (
                  <button
                    id="btn-pause-speech"
                    onClick={pauseSpeech}
                    disabled={!content}
                    className={`p-2 sm:p-2.5 rounded-full shadow-md transition-all transform hover:scale-105 disabled:opacity-25 ${
                      isSlate 
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-white shadow-cyan-400/25" 
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }`}
                    title="Pause speech synthesis"
                  >
                    <Pause size={15} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    id="btn-play-speech"
                    onClick={startSpeech}
                    disabled={!content}
                    className={`p-2 sm:p-2.5 rounded-full shadow-md transition-all transform hover:scale-105 disabled:opacity-25 ${
                      isSlate 
                        ? "bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-95 text-white shadow-cyan-500/20 glow-cyan" 
                        : "bg-amber-700 hover:bg-amber-800 text-white"
                    }`}
                    title="Play vocal stream"
                  >
                    <Play size={15} fill="currentColor" />
                  </button>
                )}

                {/* Stop Block */}
                <button
                  id="btn-stop-speech"
                  onClick={stopSpeech}
                  disabled={!content || (!isPlaying && !isPaused && activeParagraphIdx === -1)}
                  className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                    isSlate 
                      ? "bg-slate-900/40 border-white/5 text-red-400 hover:bg-red-500/10 disabled:opacity-25" 
                      : "bg-red-100 border-red-900/5 text-red-700 hover:bg-red-200 disabled:opacity-25"
                  }`}
                  title="Stop vocal stream"
                >
                  <Square size={11} fill="currentColor" />
                </button>

                {/* Skip forward */}
                <button
                  id="btn-skip-forward"
                  onClick={skipForward}
                  disabled={!content || activeParagraphIdx === -1 || activeParagraphIdx >= (content?.paragraphs?.length || 0) - 1}
                  className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                    isSlate 
                      ? "bg-slate-900/40 border-white/5 text-cyan-400 hover:bg-slate-800 disabled:opacity-25" 
                      : "bg-amber-50 border-amber-900/5 text-amber-800 hover:bg-amber-100 disabled:opacity-25"
                  }`}
                  title="Next paragraph"
                >
                  <SkipForward size={13} />
                </button>
              </div>

              {/* Progress track */}
              {content && content.paragraphs && content.paragraphs.length > 0 ? (
                <div className="flex items-center space-x-1.5 sm:space-x-2.5 w-16 xs:w-28 sm:w-44 md:w-60 flex-shrink min-w-0">
                  <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 text-right flex-shrink-0">
                    {activeParagraphIdx !== -1 ? activeParagraphIdx + 1 : 0}
                  </span>
                  <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden relative min-w-[30px]">
                    <div 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${
                        isSlate ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-amber-600"
                      }`}
                      style={{ 
                        width: `${content.paragraphs.length > 0 
                          ? ((activeParagraphIdx + 1) / content.paragraphs.length) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 flex-shrink-0">
                    {content.paragraphs.length}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 sm:space-x-2.5 w-16 xs:w-28 sm:w-44 md:w-60 opacity-30 flex-shrink min-w-0">
                  <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 text-right flex-shrink-0">0</span>
                  <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden relative min-w-[30px]">
                    <div className="absolute top-0 bottom-0 left-0 w-0"></div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 flex-shrink-0">0</span>
                </div>
              )}
            </div>

            {/* Right Column: Speed / Voice Selection */}
            <div className="flex flex-row items-center gap-1.5 sm:gap-3 flex-shrink-0">
              
              {/* Voice presets dropdown */}
              {voices.length > 0 && (
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <Volume2 size={12} className={isSlate ? "text-cyan-400" : "text-amber-800"} />
                  <select
                    id="voice-select"
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      if (isPlaying) {
                        speakParagraph(activeParagraphIdx);
                      }
                    }}
                    disabled={!content}
                    className={`text-[10px] sm:text-xs rounded-lg border p-1 sm:p-1.5 font-sans focus:ring-1 focus:ring-cyan-400 outline-none disabled:opacity-50 max-w-[80px] xs:max-w-[120px] ${
                      isSlate 
                        ? "bg-slate-900 border-white/10 text-slate-200 focus:border-cyan-400" 
                        : "bg-amber-50 border-amber-900/10 text-stone-800 focus:border-amber-600"
                    }`}
                  >
                    {voices.map(v => (
                      <option key={v.name} value={v.name}>
                        {(v.name || "").replace("Google", "").replace("Microsoft", "").trim()} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speed configuration */}
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className={`text-[8px] sm:text-[9px] font-mono uppercase tracking-wider font-bold ${isSlate ? "text-cyan-400" : "text-amber-800"} hidden xs:inline`}>Speed:</span>
                <select
                  id="rate-select"
                  value={String(speechRate)}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    setSpeechRate(rate);
                    if (isPlaying) {
                      speakParagraph(activeParagraphIdx);
                    }
                  }}
                  disabled={!content}
                  className={`text-[10px] sm:text-xs rounded-lg border p-1 sm:p-1.5 font-mono focus:ring-1 focus:ring-cyan-400 outline-none disabled:opacity-50 ${
                    isSlate 
                      ? "bg-slate-900 border-white/10 text-slate-200 focus:border-cyan-400" 
                      : "bg-amber-50 border-amber-900/10 text-stone-800 focus:border-amber-600"
                  }`}
                >
                  {![0.5, 0.75, 1.0, 1.25, 1.5, 2.0].some(r => Math.abs(r - speechRate) < 0.01) && (
                    <option value={String(speechRate)}>{speechRate}x</option>
                  )}
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1.0x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>
              </div>

            </div>

          </div>
        </footer>

        {/* Sync Credits & telemetry */}
        <div className="py-8 text-center text-[10px] opacity-40 font-mono flex items-center justify-center space-x-3 mb-24">
          <span>CATALOG_STREAM // {scrapeSource.toUpperCase()}</span>
          <span>•</span>
          <span>TELEMETRY_LINK // SYNCED</span>
        </div>

      </div>
      <TourManager />
    </div>
  );
}
