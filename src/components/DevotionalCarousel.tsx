import React from "react";
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Share2, Sparkles } from "lucide-react";
import { Devotional } from "../types";
import { BookCover } from "./BookCover";

interface DevotionalCarouselProps {
  showCarousel: boolean;
  sortedDevotionals: Devotional[];
  selectedIdx: number | null;
  cachedBookIds: string[];
  isScraping: boolean;
  isSlate: boolean;
  subTextStyle: string;
  cardBgStyle: string;
  carouselContainerRef: React.RefObject<HTMLDivElement | null>;
  isBookReadToday: (bookId: string) => boolean;
  onSelectBook: (idx: number | null) => void;
  onToggleCarousel: (show: boolean) => void;
  onPreCacheBook: (id?: string) => void;
  onClearBookCache: (id: string) => void;
  onOpenShareCard: () => void;
  onScrollCarousel: (direction: "left" | "right") => void;
}

export const DevotionalCarousel: React.FC<DevotionalCarouselProps> = ({
  showCarousel,
  sortedDevotionals,
  selectedIdx,
  cachedBookIds,
  isScraping,
  isSlate,
  subTextStyle,
  cardBgStyle,
  carouselContainerRef,
  isBookReadToday,
  onSelectBook,
  onToggleCarousel,
  onPreCacheBook,
  onClearBookCache,
  onOpenShareCard,
  onScrollCarousel
}) => {
  return (
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
                  onClick={() => onScrollCarousel("left")}
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
                  onClick={() => onScrollCarousel("right")}
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
                      onSelectBook(idx);
                      onToggleCarousel(false);
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
                        isCachedOffline={cachedBookIds.includes(book.id)}
                        onPreCache={(id) => onPreCacheBook(id)}
                        onClearCache={(id) => onClearBookCache(id)}
                      />
                    </div>
                    <p className={`text-center text-[10px] mt-2 font-semibold truncate max-w-full px-1 ${isSlate ? "text-slate-200" : "text-stone-800"}`}>
                      {book.title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Book Bento Banner - Hidden on mobile screens */}
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
                  onClick={() => onToggleCarousel(true)}
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
                      isCachedOffline={cachedBookIds.includes(sortedDevotionals[selectedIdx].id)}
                      onPreCache={(id) => onPreCacheBook(id)}
                      onClearCache={(id) => onClearBookCache(id)}
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
                  onClick={() => onToggleCarousel(true)}
                  className={`mt-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider font-bold transition-colors flex items-center space-x-1 uppercase ${
                    isSlate ? "text-cyan-400/70 hover:text-cyan-400" : "text-amber-800/70 hover:text-amber-800"
                  }`}
                >
                  <span>Change Book</span>
                </button>
              </div>

              {/* Right Side: Selected Book Details */}
              <div className="flex-1 flex flex-col justify-between h-full min-w-0 py-0.5">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`font-display font-bold text-xs sm:text-sm md:text-base truncate max-w-[200px] xs:max-w-[250px] sm:max-w-md ${isSlate ? "text-cyan-300 text-glow-cyan" : "text-amber-800"}`}>
                      {sortedDevotionals[selectedIdx].title}
                    </span>
                    <button
                      id="share-reflection-card-btn"
                      onClick={onOpenShareCard}
                      className={`text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all flex items-center space-x-1 cursor-pointer ${
                        isSlate 
                          ? "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10 hover:scale-105 active:scale-95" 
                          : "bg-amber-100 hover:bg-amber-200 border-amber-900/20 text-amber-900 shadow-sm hover:scale-105 active:scale-95"
                      }`}
                      title="Share devotional reflection as an aesthetic image card"
                    >
                      <Share2 size={10} className="text-cyan-400 shrink-0" />
                      <span>Share</span>
                    </button>
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
  );
};
