export function numberToWords(n: number): string {
  const ones = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
    "eighteen", "nineteen"
  ];
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

export function replaceNthWord(paragraphText: string, targetWord: string, occurrence: number, replacement: string): string {
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

export function isSingleChapterBook(book: string): boolean {
  const norm = book.toLowerCase().trim();
  return norm.includes("obadiah") ||
         norm.includes("philemon") ||
         norm.includes("jude") ||
         (norm.includes("john") && (norm.includes("2") || norm.includes("3") || norm.includes("second") || norm.includes("third") || norm.includes("ii") || norm.includes("iii")));
}

export function verbalizeBook(book: string): string {
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

export function formatVerseList(verseGroupStr: string): string {
  const segments = verseGroupStr
    .split(/(?:,\s*(?:and\s+)?|\s+and\s+)/i)
    .map(s => s.trim())
    .filter(Boolean);

  if (segments.length === 0) return "";

  const spokenParts = segments.map(seg => {
    const rangeMatch = seg.match(/^(\d+)\s*[-—–]\s*(\d+)$/);
    if (rangeMatch) {
      const start = numberToWords(parseInt(rangeMatch[1]));
      const end = numberToWords(parseInt(rangeMatch[2]));
      return `${start} through ${end}`;
    }
    const singleMatch = seg.match(/^(\d+)$/);
    if (singleMatch) {
      return numberToWords(parseInt(singleMatch[1]));
    }
    return seg;
  });

  if (spokenParts.length === 1) {
    const isRange = /^(\d+)\s*[-—–]\s*(\d+)$/.test(segments[0]);
    return isRange ? `verses ${spokenParts[0]}` : `verse ${spokenParts[0]}`;
  }
  
  if (spokenParts.length === 2) {
    return `verse ${spokenParts[0]} and ${spokenParts[1]}`;
  }

  const allButLast = spokenParts.slice(0, -1).join(", ");
  const last = spokenParts[spokenParts.length - 1];
  return `verse ${allButLast}, and ${last}`;
}

export function verbalizeScripture(text: string): string {
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

  // Cross-chapter range: e.g. John 1:1 - 2:3
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

  // Chapter and verse or verse list: e.g. Jeremiah 35:18, 19 or Romans 8:28, 31, 38 or John 3:16 or Genesis 1:1-3
  const pChapterVerseList = new RegExp(
    `\\b(${bookPatternStr})\\.?\\s+(\\d+)\\s*:\\s*(\\d+(?:\\s*[-—–]\\s*\\d+)?(?:\\s*(?:,\\s*(?:and\\s+)?|\\s+and\\s+)\\d+(?:\\s*[-—–]\\s*\\d+)?)*)\\b`,
    'gi'
  );
  result = result.replace(pChapterVerseList, (match, book, c, verseGroup) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const ch = numberToWords(parseInt(c));
    const verseText = formatVerseList(verseGroup);

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `${vBook} ${ch}, ${verseText}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapter ${ch}, ${verseText}`;
  });

  // Single-chapter books with verse lists or ranges without a colon: e.g. Jude 18, 19 or Jude 1-4
  const pSingleChapterBookList = new RegExp(
    `\\b(${bookPatternStr})\\.?\\s+(\\d+(?:\\s*[-—–]\\s*\\d+)?(?:\\s*(?:,\\s*(?:and\\s+)?|\\s+and\\s+)\\d+(?:\\s*[-—–]\\s*\\d+)?)*)\\b`,
    'gi'
  );
  result = result.replace(pSingleChapterBookList, (match, book, verseGroup) => {
    const { vBook } = getPrefixAndBook(book);
    if (!isSingleChapterBook(vBook)) {
      return match;
    }
    const verseText = formatVerseList(verseGroup);
    return `${vBook} ${verseText}`;
  });

  // Chapter ranges: e.g. Genesis 1-3 or Psalm 1-3
  const pChapterRange = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\s*[-—–]\\s*(\\d+)\\b`, 'gi');
  result = result.replace(pChapterRange, (match, book, num1, num2) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const n1 = numberToWords(parseInt(num1));
    const n2 = numberToWords(parseInt(num2));

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `Psalm ${n1} through ${n2}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapters ${n1} through ${n2}`;
  });

  // Single chapters: e.g. Genesis 1 or Psalm 23
  const pSingleChapter = new RegExp(`\\b(${bookPatternStr})\\.?\\s+(\\d+)\\b`, 'gi');
  result = result.replace(pSingleChapter, (match, book, num) => {
    const { vBook, hasOrdinal } = getPrefixAndBook(book);
    const n = numberToWords(parseInt(num));

    const isPsalm = vBook.toLowerCase() === "psalm";
    if (isPsalm) {
      return `${vBook} ${n}`;
    }

    const connector = hasOrdinal ? ", " : " ";
    return `${vBook}${connector}chapter ${n}`;
  });

  return result;
}
