import { useState, useEffect, useRef } from "react";
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
  Flame
} from "lucide-react";
import { BookCover } from "./components/BookCover";

function getLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface Devotional {
  id: string;
  title: string;
  link: string;
  cover: string;
  description: string;
}

interface DevotionalBlock {
  id: string;
  type: "scripture" | "body";
  text: string;
}

interface DevotionalContent {
  title: string;
  paragraphs: DevotionalBlock[];
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
    id: "everyday_conversational",
    name: "Everyday Conversational",
    description: "Warm, relatable mentor perspective; read like a personal podcast",
    icon: MessageSquare,
    badge: "Podcast Tone"
  },
  {
    id: "expressive_digital",
    name: "Expressive / Digital Native",
    description: "High-impact, condensed, and energetic core spiritual truth",
    icon: Zap,
    badge: "High Impact"
  },
  {
    id: "professional_growth",
    name: "Professional Growth",
    description: "Executive reflection: Wisdom, character, and mental resilience",
    icon: TrendingUp,
    badge: "Leadership Focus"
  },
  {
    id: "discovery_story",
    name: "Discovery & Story",
    description: "Elementary School (3rd-4th grade): Concrete, visual story analogies",
    icon: Smile,
    badge: "Kids / Family"
  },
  {
    id: "real_life_everyday",
    name: "Real Life / Everyday",
    description: "High School: Authentic guidance on modern teen dynamics & pressure",
    icon: Users,
    badge: "Teens / Youth"
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
  everyday_conversational: {
    rate: 1.05,
    pitch: 1.1,
    genderPref: "any"
  },
  expressive_digital: {
    rate: 1.15,
    pitch: 1.15,
    genderPref: "any"
  },
  professional_growth: {
    rate: 0.95,
    pitch: 0.95,
    genderPref: "male"
  },
  discovery_story: {
    rate: 0.92,
    pitch: 1.25,
    genderPref: "female"
  },
  real_life_everyday: {
    rate: 1.0,
    pitch: 1.05,
    genderPref: "any"
  }
};

export default function App() {
  // Lists and selection
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
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

  // Action to complete reading for today and advance streak
  const completeDailyReading = () => {
    const todayStr = getLocalDateString(new Date());
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

  // Load devotionals and check localStorage
  useEffect(() => {
    const savedDevotionals = localStorage.getItem("egw_devotionals_list");
    let savedSelectedId = localStorage.getItem("egw_selected_devotional_id");
    const savedTheme = localStorage.getItem("egw_theme");
    
    if (savedSelectedId === "ysrp") {
      savedSelectedId = "yrp";
      localStorage.setItem("egw_selected_devotional_id", "yrp");
    }

    if (savedTheme) {
      setTheme(savedTheme as "cream" | "slate");
    }

    if (savedDevotionals) {
      try {
        let parsed = JSON.parse(savedDevotionals) as Devotional[];
        let hasYSRP = false;
        parsed = parsed.map(d => {
          if (d.id === "ysrp") {
            hasYSRP = true;
            return {
              ...d,
              id: "yrp",
              link: d.link.replace("/ysrp", "/yrp"),
              cover: d.cover.replace("ysrp.jpg", "yrp.jpg")
            };
          }
          return d;
        });

        if (hasYSRP) {
          localStorage.setItem("egw_devotionals_list", JSON.stringify(parsed));
        }

        setDevotionals(parsed);
        setScrapeSource("local_cache");
        
        if (savedSelectedId) {
          const idx = parsed.findIndex(d => d.id === savedSelectedId);
          if (idx !== -1) setSelectedIdx(idx);
        }
      } catch (e) {
        fetchDevotionals();
      }
    } else {
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
      const engVoices = availableVoices.filter(v => v.lang.startsWith("en") || v.lang.startsWith("es"));
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

  // Sync selected index and profile to localStorage and fetch content
  useEffect(() => {
    if (devotionals.length > 0 && devotionals[selectedIdx]) {
      localStorage.setItem("egw_selected_devotional_id", devotionals[selectedIdx].id);
      localStorage.setItem("egw_selected_profile", selectedProfile);
      fetchActiveDevotionalContent(devotionals[selectedIdx], selectedProfile);
      // Reset speech when book or profile changes
      stopSpeech();
    }
  }, [selectedIdx, devotionals, selectedProfile]);

  // Load available speech voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for major English voices or natural ones
      const filtered = availableVoices.filter(v => v.lang.startsWith("en") || v.lang.startsWith("es"));
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
    if (devotionals.length > 0 && devotionals[selectedIdx]) {
      const activeBookId = devotionals[selectedIdx].id;
      const element = document.getElementById(`carousel-item-${activeBookId}`);
      if (element && carouselContainerRef.current) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [selectedIdx, devotionals]);

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
          const idx = result.data.findIndex((d: Devotional) => d.id === savedSelectedId);
          if (idx !== -1) setSelectedIdx(idx);
        }
      }
    } catch (err) {
      console.error("Error scraping devotionals:", err);
    } finally {
      setIsScraping(false);
    }
  };

  // Fetch content for the selected devotional
  const fetchActiveDevotionalContent = async (devotional: Devotional, profileStyle: string = selectedProfile) => {
    setIsLoadingContent(true);
    setContentError(null);
    setContent(null);
    try {
      // Use user's current local date/time to build the correct month and day suffix
      const month = String(currentTime.getMonth() + 1).padStart(2, "0");
      const day = String(currentTime.getDate()).padStart(2, "0");
      const dateSuffix = `${month}_${day}/`;
      
      let baseLink = devotional.link;
      if (!baseLink.endsWith("/")) {
        baseLink += "/";
      }
      const dateSpecificUrl = `${baseLink}${dateSuffix}`;

      const res = await fetch(`/api/fetch-devotional?url=${encodeURIComponent(dateSpecificUrl)}&profile=${profileStyle}`);
      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }
      const data = await res.json();
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
    
    // Auto shift selection optionally, or let them just click
    if (direction === "left" && selectedIdx > 0) {
      setSelectedIdx(selectedIdx - 1);
    } else if (direction === "right" && selectedIdx < devotionals.length - 1) {
      setSelectedIdx(selectedIdx + 1);
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

    window.speechSynthesis.cancel();
    setActiveParagraphIdx(idx);
    setIsPlaying(true);
    setIsPaused(false);

    const block = content.paragraphs[idx];
    let speechText = block.text;

    // If it's the first paragraph, optionally announce the title
    if (idx === 0) {
      speechText = `${content.title}. ${speechText}`;
    }

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
      if (e.error !== "interrupted") {
        stopSpeech();
      }
    };

    window.speechSynthesis.speak(utterance);
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
          className={`px-4 py-2.5 md:py-3.5 border-b transition-all ${
            isSlate 
              ? "bg-[#020617]/40 backdrop-blur-xl border-white/5" 
              : "bg-[#FAF7F2]/80 backdrop-blur-xl border-amber-900/5"
          }`}
        >
          <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
            {/* Left side: branding/title */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl shrink-0 ${isSlate ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]" : "bg-amber-500/10 text-amber-800"}`}>
                <BookOpen size={18} className="animate-pulse" />
              </div>
              <div>
                <h1 className="font-display text-base sm:text-lg font-bold tracking-tight">
                  {isSlate ? "Ellen G. White Devotionals" : "EGW Daily Devotionals"}
                </h1>
              </div>
            </div>

            {/* Right side: HUD controls & Style selection */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between sm:justify-end">
              
              {/* Reading Style Selection Dropdown */}
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono uppercase font-bold ${isSlate ? "text-slate-400" : "text-[#6E665A]"}`}>Style:</span>
                <select
                  id="header-profile-switcher"
                  value={selectedProfile}
                  onChange={(e) => {
                    const newProfile = e.target.value;
                    setSelectedProfile(newProfile);
                    applyProfileVoiceSettings(newProfile);
                  }}
                  className={`text-xs rounded-xl border px-2.5 py-1 font-sans font-medium focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer ${
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
                className={`flex items-center space-x-2 px-3 py-1 rounded-2xl border font-mono transition-all duration-300 ${
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
                <Flame size={14} className={`transition-all duration-300 ${hasCompletedToday ? "animate-pulse fill-amber-400 text-amber-500" : "opacity-60"}`} />
                <div className="text-left leading-none">
                  <div className="text-xs font-bold flex items-baseline">
                    <span>{streakCount}</span>
                    <span className="text-[8px] ml-0.5 opacity-85 font-normal">DAYS</span>
                  </div>
                </div>
              </div>

              {/* Clock - Hidden on mobile, compact on tablet/desktop */}
              <div className="hidden md:block text-right border-r border-white/10 pr-4 leading-none">
                <div className="text-sm font-light font-mono leading-none">
                  {timeString}
                </div>
                <div className={`text-[8.5px] tracking-wider font-mono mt-1 ${isSlate ? "text-cyan-400/80" : "text-amber-800"}`}>
                  {dateString}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1.5">
                <button
                  id="sync-button"
                  onClick={fetchDevotionals}
                  disabled={isScraping}
                  className={`p-1.5 rounded-lg transition-all flex items-center space-x-1 text-xs font-mono font-bold border ${
                    isSlate 
                      ? "bg-slate-900/50 hover:bg-slate-800 text-cyan-400 border-cyan-500/30" 
                      : "bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-900/10"
                  }`}
                  title="Refresh database catalogs"
                >
                  <RefreshCw size={11} className={isScraping ? "animate-spin" : ""} />
                  <span className="hidden xs:inline text-[10px]">SYNC</span>
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
            </div>
          </div>
        </header>

        {/* 4. Carousel Area */}
        <section id="carousel-section" className={`px-4 py-3 border-b ${isSlate ? "border-white/5 bg-slate-950/20" : "border-amber-900/5 bg-amber-50/20"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
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
                  disabled={selectedIdx === 0}
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
                  disabled={selectedIdx === devotionals.length - 1}
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
            {isScraping && devotionals.length === 0 ? (
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
                {devotionals.map((book, idx) => (
                  <div
                    key={book.id}
                    id={`carousel-item-${book.id}`}
                    onClick={() => setSelectedIdx(idx)}
                    className="flex-none w-28 sm:w-36 snap-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <BookCover
                      title={book.title}
                      coverUrl={book.cover}
                      active={idx === selectedIdx}
                      bookId={book.id}
                    />
                    <p className={`text-center text-[10px] mt-2 font-semibold truncate max-w-full px-1 ${isSlate ? "text-slate-200" : "text-stone-800"}`}>
                      {book.title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Book Bento Banner - Hidden on mobile screens to prioritize vertical space */}
            {devotionals.length > 0 && devotionals[selectedIdx] && (
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
                        {devotionals[selectedIdx].title}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${isSlate ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/10 text-amber-800"}`}>
                        ACTIVE CORE
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed font-sans ${subTextStyle}`}>
                      {devotionals[selectedIdx].description}
                    </p>
                    <a
                      href={devotionals[selectedIdx].link}
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
                    NODE://{devotionals[selectedIdx].id.toUpperCase()}
                  </div>
                </div>
              </div>
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
                <p className={`text-xs mt-1.5 font-mono ${subTextStyle}`}>Fetching: {devotionals[selectedIdx]?.title || "Ellen G. White Estate"}</p>
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
                onClick={() => devotionals[selectedIdx] && fetchActiveDevotionalContent(devotionals[selectedIdx])}
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
              
              {/* Devotional Heading */}
              <header className="text-center mb-10 pb-8 border-b border-white/5">
                <span className={`text-[10px] uppercase tracking-widest font-mono font-bold ${isSlate ? "text-cyan-400" : "text-amber-800"}`}>
                  {devotionals[selectedIdx]?.title || "Featured Daily Entry"}
                </span>
                <h2 className={`font-display text-2xl sm:text-3xl font-bold tracking-tight mt-2.5 leading-tight ${isSlate ? "text-white" : "text-stone-950"}`}>
                  {content.title}
                </h2>
                <div className="mt-3 flex flex-col items-center justify-center gap-2 select-none">
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
                  {(() => {
                    const profile = DEVOTIONAL_PROFILES.find(p => p.id === selectedProfile);
                    if (!profile) return null;
                    return (
                      <p className={`text-[11px] sm:text-xs max-w-md text-center font-sans font-medium px-4 ${
                        isSlate ? "text-slate-300" : "text-stone-700"
                      }`}>
                        {profile.description}
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

                    <div className="w-full sm:w-auto shrink-0">
                      {hasCompletedToday ? (
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center justify-center space-x-2 border ${
                          isSlate 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                            : "bg-emerald-600/10 border-emerald-600/20 text-emerald-800"
                        }`}>
                          <Check size={14} className="text-emerald-400 font-bold" />
                          <span>CHECKED IN ({streakCount}d)</span>
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
            <div id="no-content-state" className="flex-1 flex flex-col items-center justify-center py-24 text-center">
              <Compass className="text-cyan-400 animate-spin" size={48} />
              <p className="font-mono italic text-sm mt-4">Pre-configuring immersive telemetry...</p>
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
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left Column: Book Details */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className={`w-11 h-15 rounded-lg overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center border ${
                isSlate ? "bg-slate-900 border-white/10" : "bg-amber-50 border-amber-900/10"
              }`}>
                {devotionals[selectedIdx]?.cover ? (
                  <img 
                    src={devotionals[selectedIdx].cover} 
                    alt="cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-cyan-400 font-mono">
                    {devotionals[selectedIdx]?.id.toUpperCase() || "EGW"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 md:flex-initial">
                <p className={`text-[9px] uppercase font-mono tracking-widest font-bold ${isSlate ? "text-cyan-400" : "text-amber-800"}`}>
                  {devotionals[selectedIdx]?.title || "Select a Book"}
                </p>
                <h4 className="font-display text-sm font-bold truncate max-w-[250px] text-balance">
                  {content?.title || "No devotional active"}
                </h4>
                <p className={`text-[10px] mt-0.5 truncate max-w-[250px] font-mono ${subTextStyle}`}>
                  {content && activeParagraphIdx !== -1 
                    ? `PARAGRAPH // 0${activeParagraphIdx + 1} OF 0${content.paragraphs.length}`
                    : "PLAYER IDLE"
                  }
                </p>
              </div>
            </div>

            {/* Middle Column: Player Controls */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center space-x-4">
                {/* Skip back */}
                <button
                  id="btn-skip-backward"
                  onClick={skipBackward}
                  disabled={!content || activeParagraphIdx <= 0}
                  className={`p-2 rounded-xl border transition-all ${
                    isSlate 
                      ? "bg-slate-900/40 border-white/5 text-cyan-400 hover:bg-slate-800 disabled:opacity-25" 
                      : "bg-amber-50 border-amber-900/5 text-amber-800 hover:bg-amber-100 disabled:opacity-25"
                  }`}
                  title="Previous paragraph"
                >
                  <SkipBack size={15} />
                </button>

                {/* Play / Pause Toggle with custom glow shadows */}
                {isPlaying ? (
                  <button
                    id="btn-pause-speech"
                    onClick={pauseSpeech}
                    disabled={!content}
                    className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-25 ${
                      isSlate 
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-white shadow-cyan-400/25" 
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }`}
                    title="Pause speech synthesis"
                  >
                    <Pause size={18} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    id="btn-play-speech"
                    onClick={startSpeech}
                    disabled={!content}
                    className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-25 ${
                      isSlate 
                        ? "bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-95 text-white shadow-cyan-500/20 glow-cyan" 
                        : "bg-amber-700 hover:bg-amber-800 text-white"
                    }`}
                    title="Play vocal stream"
                  >
                    <Play size={18} fill="currentColor" />
                  </button>
                )}

                {/* Stop Block */}
                <button
                  id="btn-stop-speech"
                  onClick={stopSpeech}
                  disabled={!content || (!isPlaying && !isPaused && activeParagraphIdx === -1)}
                  className={`p-2 rounded-xl border transition-all ${
                    isSlate 
                      ? "bg-slate-900/40 border-white/5 text-red-400 hover:bg-red-500/10 disabled:opacity-25" 
                      : "bg-red-100 border-red-900/5 text-red-700 hover:bg-red-200 disabled:opacity-25"
                  }`}
                  title="Stop vocal stream"
                >
                  <Square size={13} fill="currentColor" />
                </button>

                {/* Skip forward */}
                <button
                  id="btn-skip-forward"
                  onClick={skipForward}
                  disabled={!content || activeParagraphIdx === -1 || activeParagraphIdx >= (content?.paragraphs?.length || 0) - 1}
                  className={`p-2 rounded-xl border transition-all ${
                    isSlate 
                      ? "bg-slate-900/40 border-white/5 text-cyan-400 hover:bg-slate-800 disabled:opacity-25" 
                      : "bg-amber-50 border-amber-900/5 text-amber-800 hover:bg-amber-100 disabled:opacity-25"
                  }`}
                  title="Next paragraph"
                >
                  <SkipForward size={15} />
                </button>
              </div>

              {/* Progress track */}
              {content && content.paragraphs && content.paragraphs.length > 0 ? (
                <div className="flex items-center space-x-2.5 w-60 sm:w-72">
                  <span className="text-[9px] font-mono text-slate-400 w-5 text-right">
                    {activeParagraphIdx !== -1 ? activeParagraphIdx + 1 : 0}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
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
                  <span className="text-[9px] font-mono text-slate-400 w-5">
                    {content.paragraphs.length}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 w-60 sm:w-72 opacity-30">
                  <span className="text-[9px] font-mono text-slate-400 w-5 text-right">0</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-0 w-0"></div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 w-5">0</span>
                </div>
              )}
            </div>

            {/* Right Column: Speed / Voice Selection */}
            <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
              
              {/* Voice presets dropdown */}
              {voices.length > 0 && (
                <div className="flex items-center space-x-1.5">
                  <Volume2 size={13} className={isSlate ? "text-cyan-400" : "text-amber-800"} />
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
                    className={`text-xs rounded-lg border p-1.5 font-sans focus:ring-1 focus:ring-cyan-400 outline-none disabled:opacity-50 ${
                      isSlate 
                        ? "bg-slate-900 border-white/10 text-slate-200 focus:border-cyan-400" 
                        : "bg-amber-50 border-amber-900/10 text-stone-800 focus:border-amber-600"
                    }`}
                  >
                    {voices.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name.replace("Google", "").replace("Microsoft", "").trim()} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speed configuration */}
              <div className="flex items-center space-x-1.5">
                <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isSlate ? "text-cyan-400" : "text-amber-800"}`}>Speed:</span>
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
                  className={`text-xs rounded-lg border p-1.5 font-mono focus:ring-1 focus:ring-cyan-400 outline-none disabled:opacity-50 ${
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
    </div>
  );
}
