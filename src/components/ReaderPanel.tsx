import React from "react";
import { Loader2, Info, Sparkles, Volume2, Flame, Check } from "lucide-react";
import { Devotional, DevotionalContent } from "../types";
import { DEVOTIONAL_PROFILES } from "../config/devotionals";
import { ProjectIcon } from "./ProjectIcon";

interface ReaderPanelProps {
  content: DevotionalContent | null;
  isLoadingContent: boolean;
  contentError: string | null;
  selectedProfile: string;
  selectedDevotional: Devotional | null;
  selectedId: string | null;
  isSlate: boolean;
  subTextStyle: string;
  activeParagraphIdx: number;
  paragraphRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  hasCompletedToday: boolean;
  streakCount: number;
  isBookReadToday: (bookId: string) => boolean;
  onRetryFetch: () => void;
  onCompleteReading: () => void;
  onResetBookStatus: (bookId: string) => void;
}

export const ReaderPanel: React.FC<ReaderPanelProps> = ({
  content,
  isLoadingContent,
  contentError,
  selectedProfile,
  selectedDevotional,
  selectedId,
  isSlate,
  subTextStyle,
  activeParagraphIdx,
  paragraphRefs,
  hasCompletedToday,
  streakCount,
  isBookReadToday,
  onRetryFetch,
  onCompleteReading,
  onResetBookStatus
}) => {
  return (
    <main id="reading-pane" className="flex-1 px-4 sm:px-6 py-6 md:py-10 max-w-3xl mx-auto w-full flex flex-col justify-between z-10">
      {isLoadingContent ? (
        <div id="loading-reading" className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className={`animate-spin ${isSlate ? "text-cyan-400" : "text-amber-600"}`} size={36} />
          <div className="text-center">
            <p className="font-display font-medium text-base">Initializing Devotional Stream...</p>
            <p className={`text-xs mt-1.5 font-mono ${subTextStyle}`}>Fetching: {selectedDevotional?.title || "Ellen G. White Estate"}</p>
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
            onClick={onRetryFetch}
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
                    className={`relative pl-5 pr-4 py-4 border-l-4 rounded-r-2xl transition-all duration-300 ${
                      isActive 
                        ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] scale-[1.01]" 
                        : isSlate 
                          ? "border-cyan-500/20 bg-slate-900/30"
                          : "border-amber-600/30 bg-black/[0.02]"
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
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? isSlate 
                        ? "bg-slate-800/40 shadow-xl border border-cyan-500/25 scale-[1.01]" 
                        : "bg-amber-500/10 shadow-sm border border-amber-500/15 scale-[1.01]"
                      : isSlate 
                        ? "text-slate-200" 
                        : "text-stone-800"
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
                        onClick={() => onResetBookStatus(selectedId)}
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
                      onClick={onCompleteReading}
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
  );
};
