import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Share2 } from "lucide-react";
import { useTour, TourManager } from "./components/Tour";
import { ShareImageCardModal } from "./components/ShareImageCardModal";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DevotionalCarousel } from "./components/DevotionalCarousel";
import { ReaderPanel } from "./components/ReaderPanel";
import { TTSPlayer } from "./components/TTSPlayer";
import { CacheProgressBanner } from "./components/CacheProgressBanner";
import { dailyDevotionals, UNREAD_BOOKS_ORDER } from "./config/devotionals";
import { Devotional, DevotionalContent, CacheProgressState } from "./types";
import { getLocalDateString, calculateInitialStreak } from "./utils/date";
import { usePWAStatus } from "./hooks/usePWAStatus";
import { useTTS } from "./hooks/useTTS";

export default function App() {
  const { startTour } = useTour();
  const { isInstallable, isAppInstalled, isOnline, handleInstallPWA } = usePWAStatus();

  // Lists & selection state
  const [devotionals, setDevotionals] = useState<Devotional[]>(dailyDevotionals);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return localStorage.getItem("egw_selected_devotional_id");
  });
  const [bookReadHistory, setBookReadHistory] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("egw_book_read_history");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showCarousel, setShowCarousel] = useState<boolean>(() => {
    const savedSelectedId = localStorage.getItem("egw_selected_devotional_id");
    return savedSelectedId ? false : true;
  });
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeSource, setScrapeSource] = useState<string>("local");

  // Content state
  const [content, setContent] = useState<DevotionalContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Profile style
  const [selectedProfile, setSelectedProfile] = useState<string>(() => {
    return localStorage.getItem("egw_selected_profile") || "clear_modern";
  });

  // Calendar date state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Appearance
  const [theme, setTheme] = useState<"cream" | "slate">(() => {
    return (localStorage.getItem("egw_theme") as "cream" | "slate") || "slate";
  });

  // Spiritual streak state
  const [streakCount, setStreakCount] = useState<number>(calculateInitialStreak);
  const [lastReadDate, setLastReadDate] = useState<string>(() => {
    return localStorage.getItem("egw_last_read_date") || "";
  });
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(() => {
    const todayStr = getLocalDateString(new Date());
    const storedLastReadDate = localStorage.getItem("egw_last_read_date");
    return todayStr === storedLastReadDate;
  });

  // Offline pre-cache state
  const [cachedBookIds, setCachedBookIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("egw_cached_books");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [cacheProgress, setCacheProgress] = useState<CacheProgressState>({
    active: false,
    title: "",
    current: 0,
    total: 0
  });

  // Share card modal & selection states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCardText, setShareCardText] = useState("");
  const [floatingSelectionText, setFloatingSelectionText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const paragraphRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const cancelCacheRef = useRef<boolean>(false);
  const devotionalCacheRef = useRef<{
    book: string;
    date: string;
    profile: string;
    data: DevotionalContent;
  } | null>(null);

  const isBookReadToday = useCallback((bookId: string): boolean => {
    const val = bookReadHistory[bookId];
    if (!val) return false;
    const dateObj = typeof val === "number" ? new Date(val) : new Date(Number(val) || val);
    if (isNaN(dateObj.getTime())) return false;
    return getLocalDateString(dateObj) === getLocalDateString(new Date());
  }, [bookReadHistory]);

  // Derived sorted list: selected book first, followed by MRU sorted books
  const sortedDevotionals = useMemo(() => {
    if (devotionals.length === 0) return [];
    
    const selectedBook = selectedId ? devotionals.find(b => b.id === selectedId) : null;
    const remainingBooks = selectedId ? devotionals.filter(b => b.id !== selectedId) : [...devotionals];

    remainingBooks.sort((a, b) => {
      const timeA = bookReadHistory[a.id] || 0;
      const timeB = bookReadHistory[b.id] || 0;
      
      if (timeA > 0 && timeB > 0) {
        return timeB - timeA;
      }
      if (timeA > 0) return -1;
      if (timeB > 0) return 1;
      
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

  // Mark completed reading action
  const completeDailyReading = useCallback(() => {
    const todayStr = getLocalDateString(new Date());

    if (selectedId) {
      setBookReadHistory(prev => {
        const updated = { ...prev, [selectedId]: Date.now() };
        localStorage.setItem("egw_book_read_history", JSON.stringify(updated));
        return updated;
      });
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
  }, [hasCompletedToday, lastReadDate, selectedId, streakCount]);

  // Hook for TTS speech synthesis
  const {
    isPlaying,
    isPaused,
    activeParagraphIdx,
    speechRate,
    speechPitch,
    setSpeechRate,
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    startSpeech,
    pauseSpeech,
    stopSpeech,
    skipForward,
    skipBackward,
    speakParagraph,
    applyProfileVoiceSettings
  } = useTTS({
    content,
    onCompleteReading: completeDailyReading
  });

  // Fetch content for active devotional
  const fetchActiveDevotionalContent = useCallback(async (
    devotional: Devotional, 
    profileStyle: string = selectedProfile,
    targetDate: Date = selectedDate
  ) => {
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateSuffix = `${month}_${day}/`;
    const dayParam = `${month}_${day}`;

    if (
      devotionalCacheRef.current &&
      devotionalCacheRef.current.book === devotional.id &&
      devotionalCacheRef.current.date === dateSuffix &&
      devotionalCacheRef.current.profile === profileStyle
    ) {
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
  }, [selectedDate, selectedProfile]);

  // Sync selection to localStorage and fetch content
  useEffect(() => {
    if (selectedId !== null) {
      const activeBook = devotionals.find(d => d.id === selectedId);
      if (activeBook) {
        localStorage.setItem("egw_selected_devotional_id", selectedId);
        localStorage.setItem("egw_selected_profile", selectedProfile);
        fetchActiveDevotionalContent(activeBook, selectedProfile, selectedDate);
        stopSpeech();
      }
    }
  }, [selectedId, selectedProfile, selectedDate, devotionals, fetchActiveDevotionalContent, stopSpeech]);

  // Initial load
  useEffect(() => {
    const savedSelectedId = localStorage.getItem("egw_selected_devotional_id");
    setScrapeSource("local");
    
    if (savedSelectedId && dailyDevotionals.some(d => d.id === savedSelectedId)) {
      setSelectedId(savedSelectedId);
      setShowCarousel(false);
    } else {
      setSelectedId(null);
      setShowCarousel(true);
    }
  }, []);

  // Text selection listener for share modal
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const text = sel.toString().trim();
        if (text.length >= 4) {
          setFloatingSelectionText(text);
          try {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionPosition({
              x: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90),
              y: Math.max(rect.top - 12, 60)
            });
          } catch {
            setSelectionPosition(null);
          }
          return;
        }
      }
      setFloatingSelectionText("");
      setSelectionPosition(null);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Auto-scrolling for active paragraph
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

  // Auto-scrolling for active carousel item
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

  // Pre-cache operations
  const handleCancelCache = () => {
    cancelCacheRef.current = true;
  };

  const handleClearBookCache = (bookId: string) => {
    setCachedBookIds(prev => {
      const updated = prev.filter(id => id !== bookId);
      try {
        localStorage.setItem("egw_cached_books", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed updating localStorage after clearing cache:", e);
      }
      return updated;
    });
  };

  const handlePreCacheBook = async (bookIdOverride?: string) => {
    const targetBookId = bookIdOverride || selectedId || (sortedDevotionals.length > 0 ? sortedDevotionals[0].id : null);
    if (!targetBookId) return;

    const bookObj = devotionals.find(b => b.id === targetBookId);
    if (!bookObj) return;

    setCachedBookIds(prev => {
      if (!prev.includes(targetBookId)) {
        const updated = [...prev, targetBookId];
        try {
          localStorage.setItem("egw_cached_books", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed saving cached books to localStorage:", e);
        }
        return updated;
      }
      return prev;
    });

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
      }, 3500);
    } else {
      setCacheProgress({ active: false, title: "", current: 0, total: 0 });
    }
  };

  const handleOpenShareCard = (customText?: string) => {
    let passage = (typeof customText === "string" && customText.trim()) || 
                  (typeof floatingSelectionText === "string" && floatingSelectionText.trim()) || 
                  "";
    if (!passage && content) {
      const scriptureBlocks = content.paragraphs?.filter(p => p.type === "scripture" && p.text?.trim());
      if (scriptureBlocks && scriptureBlocks.length > 0) {
        passage = scriptureBlocks.map(p => p.text.trim()).join("\n\n");
      } else {
        passage = content.paragraphs?.find(p => p.text?.trim())?.text?.trim() || 
                  content.title?.trim() || 
                  "";
      }
    }
    if (!passage && selectedIdx !== null && sortedDevotionals[selectedIdx]) {
      passage = sortedDevotionals[selectedIdx].description?.trim() || 
                sortedDevotionals[selectedIdx].title?.trim() || 
                "";
    }
    const finalPassage = passage.trim() || "Search me, O God, and know my heart: try me, and know my thoughts.";
    setShareCardText(finalPassage);
    setIsShareModalOpen(true);
    setFloatingSelectionText("");
    setSelectionPosition(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "cream" ? "slate" : "cream";
    setTheme(nextTheme);
    localStorage.setItem("egw_theme", nextTheme);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselContainerRef.current) {
      const scrollAmt = carouselContainerRef.current.clientWidth * 0.6;
      carouselContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

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

  return (
    <div 
      id="app-root" 
      className={`min-h-screen w-full flex relative overflow-hidden transition-colors duration-500 ${bgStyle}`}
      style={isSlate ? { background: "radial-gradient(circle at 50% 10%, #0f172a 0%, #020617 100%)" } : undefined}
    >
      {/* 1. Immersive Atmospheric Glows */}
      {isSlate && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] atmosphere-cyan pointer-events-none z-0"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] atmosphere-amber pointer-events-none z-0"></div>
        </>
      )}

      {/* 2. Interactive Navigation Sidebar */}
      <Sidebar isSlate={isSlate} />

      {/* 3. Main Dashboard Frame */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative overflow-y-auto max-h-screen">
        <Header
          isSlate={isSlate}
          isOnline={isOnline}
          isAppInstalled={isAppInstalled}
          onInstallPWA={handleInstallPWA}
          onStartTour={() => startTour("onboarding")}
          onToggleTheme={toggleTheme}
          selectedProfile={selectedProfile}
          onSelectProfile={(p) => {
            setSelectedProfile(p);
            applyProfileVoiceSettings(p);
          }}
          streakCount={streakCount}
          hasCompletedToday={hasCompletedToday}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <CacheProgressBanner
          cacheProgress={cacheProgress}
          isSlate={isSlate}
          onCancelCache={handleCancelCache}
        />

        <DevotionalCarousel
          showCarousel={showCarousel}
          sortedDevotionals={sortedDevotionals}
          selectedIdx={selectedIdx}
          cachedBookIds={cachedBookIds}
          isScraping={isScraping}
          isSlate={isSlate}
          subTextStyle={subTextStyle}
          cardBgStyle={cardBgStyle}
          carouselContainerRef={carouselContainerRef}
          isBookReadToday={isBookReadToday}
          onSelectBook={handleSelectBook}
          onToggleCarousel={setShowCarousel}
          onPreCacheBook={handlePreCacheBook}
          onClearBookCache={handleClearBookCache}
          onOpenShareCard={() => handleOpenShareCard()}
          onScrollCarousel={scrollCarousel}
        />

        <ReaderPanel
          content={content}
          isLoadingContent={isLoadingContent}
          contentError={contentError}
          selectedProfile={selectedProfile}
          selectedDevotional={selectedIdx !== null ? sortedDevotionals[selectedIdx] : null}
          selectedId={selectedId}
          isSlate={isSlate}
          subTextStyle={subTextStyle}
          activeParagraphIdx={activeParagraphIdx}
          paragraphRefs={paragraphRefs}
          hasCompletedToday={hasCompletedToday}
          streakCount={streakCount}
          isBookReadToday={isBookReadToday}
          onRetryFetch={() => selectedIdx !== null && sortedDevotionals[selectedIdx] && fetchActiveDevotionalContent(sortedDevotionals[selectedIdx])}
          onCompleteReading={completeDailyReading}
          onResetBookStatus={(bId) => {
            setBookReadHistory(prev => {
              const updated = { ...prev };
              delete updated[bId];
              localStorage.setItem("egw_book_read_history", JSON.stringify(updated));
              return updated;
            });
          }}
        />

        {/* Catalog Telemetry Link */}
        <div className="py-8 text-center text-[10px] opacity-40 font-mono flex items-center justify-center space-x-3 mb-24">
          <span>CATALOG_STREAM // {scrapeSource.toUpperCase()}</span>
          <span>•</span>
          <span>TELEMETRY_LINK // SYNCED</span>
        </div>
      </div>

      {/* 4. Audio Control Console Anchored at Bottom */}
      <TTSPlayer
        content={content}
        selectedDevotional={selectedIdx !== null ? sortedDevotionals[selectedIdx] : null}
        isPlaying={isPlaying}
        isPaused={isPaused}
        activeParagraphIdx={activeParagraphIdx}
        speechRate={speechRate}
        speechPitch={speechPitch}
        voices={voices}
        selectedVoiceName={selectedVoiceName}
        isSlate={isSlate}
        onStartSpeech={startSpeech}
        onPauseSpeech={pauseSpeech}
        onStopSpeech={stopSpeech}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onSelectVoiceName={setSelectedVoiceName}
        onSetSpeechRate={setSpeechRate}
        onSpeakParagraph={speakParagraph}
      />

      {/* Floating Selection Action Trigger */}
      {floatingSelectionText && selectionPosition && (
        <div
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`
          }}
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => handleOpenShareCard(floatingSelectionText)}
            className="bg-slate-950/95 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/80 hover:border-cyan-200 shadow-2xl rounded-full px-4 py-2 text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer group hover:scale-105 active:scale-95"
          >
            <Share2 size={13} className="text-cyan-400 group-hover:text-slate-950 shrink-0" />
            <span>Share Selection as Image Card</span>
          </button>
        </div>
      )}

      {/* Share Reflection Image Card Customizer Modal */}
      {isShareModalOpen && (
        <ShareImageCardModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          initialText={shareCardText}
          bookTitle={selectedIdx !== null && sortedDevotionals[selectedIdx] ? sortedDevotionals[selectedIdx].title : "Ellen G. White Devotional"}
          dateStr={selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          isSlateTheme={isSlate}
        />
      )}

      <TourManager />
    </div>
  );
}
