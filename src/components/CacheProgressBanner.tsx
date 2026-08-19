import React from "react";
import { Download, Check } from "lucide-react";
import { CacheProgressState } from "../types";

interface CacheProgressBannerProps {
  cacheProgress: CacheProgressState;
  isSlate: boolean;
  onCancelCache: () => void;
}

export const CacheProgressBanner: React.FC<CacheProgressBannerProps> = ({
  cacheProgress,
  isSlate,
  onCancelCache
}) => {
  if (!cacheProgress.active) return null;

  return (
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
              onClick={onCancelCache}
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
  );
};
