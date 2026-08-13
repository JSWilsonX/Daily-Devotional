import React, { useState } from "react";
import { Check, Download, Trash2, RefreshCw, X } from "lucide-react";

interface BookCoverProps {
  title: string;
  coverUrl: string;
  active: boolean;
  bookId: string;
  isReadToday?: boolean;
  isCachedOffline?: boolean;
  onPreCache?: (bookId: string) => void;
  onClearCache?: (bookId: string) => void;
}

const THEME_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  ohc: { bg: "from-sky-950 via-slate-900 to-sky-950", border: "border-sky-500/30", accent: "text-sky-300" },
  fh: { bg: "from-red-950 via-rose-900 to-red-950", border: "border-rose-500/30", accent: "text-rose-300" },
  ul: { bg: "from-red-950 via-stone-900 to-red-950", border: "border-red-400/30", accent: "text-red-300" },
  tmk: { bg: "from-indigo-950 via-indigo-900 to-indigo-950", border: "border-indigo-500/30", accent: "text-indigo-300" },
  rc: { bg: "from-emerald-950 via-emerald-900 to-emerald-950", border: "border-emerald-500/30", accent: "text-emerald-300" },
  ctr: { bg: "from-blue-950 via-indigo-950 to-blue-950", border: "border-amber-500/30", accent: "text-amber-300" },
  cc: { bg: "from-amber-900 via-stone-800 to-amber-950", border: "border-amber-400/30", accent: "text-amber-200" },
  ag: { bg: "from-rose-950 via-rose-900 to-rose-950", border: "border-rose-400/30", accent: "text-rose-300" },
  hp: { bg: "from-blue-950 via-cyan-900 to-blue-950", border: "border-cyan-500/30", accent: "text-cyan-300" },
  lhu: { bg: "from-yellow-950 via-amber-900 to-yellow-950", border: "border-amber-400/30", accent: "text-amber-200" },
  mar: { bg: "from-purple-950 via-violet-900 to-purple-950", border: "border-violet-500/30", accent: "text-violet-300" },
  mlt: { bg: "from-amber-950 via-amber-900 to-amber-950", border: "border-amber-500/30", accent: "text-amber-300" },
  ofc: { bg: "from-stone-900 via-amber-950 to-stone-900", border: "border-amber-600/30", accent: "text-amber-300" },
  blj: { bg: "from-teal-950 via-teal-900 to-teal-950", border: "border-teal-500/30", accent: "text-teal-300" },
  flb: { bg: "from-zinc-900 via-zinc-800 to-zinc-900", border: "border-zinc-500/30", accent: "text-zinc-300" },
  hb: { bg: "from-teal-950 via-emerald-950 to-teal-950", border: "border-emerald-500/30", accent: "text-emerald-300" },
  rre: { bg: "from-orange-950 via-amber-900 to-orange-950", border: "border-amber-500/30", accent: "text-amber-300" },
  sd: { bg: "from-red-950 via-red-900 to-red-950", border: "border-red-500/30", accent: "text-red-300" },
  tdg: { bg: "from-stone-950 via-stone-900 to-stone-950", border: "border-stone-500/30", accent: "text-stone-300" },
  wgd: { bg: "from-slate-950 via-rose-950 to-slate-950", border: "border-rose-500/30", accent: "text-rose-300" },
  yrp: { bg: "from-orange-950 via-orange-900 to-orange-950", border: "border-orange-500/30", accent: "text-orange-300" },
  jnn: { bg: "from-fuchsia-950 via-purple-900 to-fuchsia-950", border: "border-fuchsia-500/30", accent: "text-fuchsia-300" }
};

export const BookCover: React.FC<BookCoverProps> = ({ 
  title, 
  coverUrl, 
  active, 
  bookId, 
  isReadToday, 
  isCachedOffline,
  onPreCache,
  onClearCache
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const colors = THEME_COLORS[bookId] || {
    bg: "from-stone-900 via-stone-800 to-stone-900",
    border: "border-stone-500/30",
    accent: "text-stone-300"
  };

  // Abbreviations for books to put on procedural cover
  const getAbbreviation = (t: string) => {
    return t
      .split(" ")
      .filter(w => !["and", "of", "the", "to", "with", "in"].includes(w.toLowerCase()))
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  return (
    <div
      id={`book-cover-${bookId}`}
      className={`relative rounded-lg shadow-xl overflow-hidden aspect-[2/3] w-full transition-all duration-500 ${
        active 
          ? "ring-4 ring-amber-400/50 scale-100 shadow-amber-950/20 shadow-2xl" 
          : "scale-90 hover:scale-95 opacity-65 hover:opacity-90 cursor-pointer"
      }`}
    >
      {/* Real Image Cover */}
      {!imageError && coverUrl && (
        <img
          id={`book-img-${bookId}`}
          src={coverUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setImageError(true);
            setLoading(false);
          }}
        />
      )}

      {/* Procedural Fallback Cover (Elegant Leather bound style) */}
      {(imageError || !coverUrl || loading) && (
        <div
          id={`book-fallback-${bookId}`}
          className={`absolute inset-0 bg-gradient-to-b ${colors.bg} flex flex-col justify-between p-4 text-center border-4 ${colors.border} select-none`}
        >
          {/* Gold foil header lines */}
          <div className="border border-double border-amber-500/20 p-2 rounded flex flex-col justify-center items-center h-full">
            <span className={`text-[10px] uppercase tracking-[0.25em] ${colors.accent} font-mono mb-1`}>
              Daily Devotional
            </span>
            <div className="h-[1px] w-12 bg-amber-500/20 my-2"></div>
            
            {/* Elegant Serif Title */}
            <h3 className="font-serif text-lg leading-tight text-stone-100 font-bold tracking-wide break-words max-h-24 overflow-hidden mb-2">
              {title}
            </h3>

            <div className="mt-4 flex items-center justify-center w-12 h-12 rounded-full border border-amber-500/25 bg-black/10">
              <span className="font-serif text-amber-300 font-semibold tracking-wider text-sm">
                {getAbbreviation(title)}
              </span>
            </div>

            <div className="h-[1px] w-12 bg-amber-500/20 my-2 mt-4"></div>
            <span className="text-[10px] italic text-stone-400 font-serif">
              Ellen G. White
            </span>
          </div>

          {/* Book spine line overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-white/5 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/20 to-transparent"></div>
        </div>
      )}

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>

      {/* Read Today Green Checkmark Badge */}
      {isReadToday && (
        <div 
          className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-1 shadow-lg z-20 animate-fade-in flex items-center justify-center border border-white/30"
          title="Read Today"
        >
          <Check size={10} className="stroke-[3]" />
        </div>
      )}

      {/* Primary Lower-Left Cache Badge & Action */}
      <div className="absolute bottom-1.5 left-1.5 z-30 select-none">
        {isCachedOffline ? (
          /* CACHED STATE: Checkmark Badge with Secondary Action Dropdown */
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="bg-emerald-950/90 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-400/80 shadow-lg rounded-md px-1.5 py-0.5 flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              title="Book Cached Offline - Click to manage or delete download"
            >
              <Check size={10} className="stroke-[3] shrink-0" />
              <span className="text-[8px] font-mono font-bold tracking-tight">CACHED</span>
            </button>

            {showMenu && (
              <div 
                className="absolute bottom-7 left-0 z-50 bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 rounded-lg p-1.5 shadow-2xl min-w-[145px] text-xs font-mono animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Offline Storage</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onClearCache?.(bookId);
                  }}
                  className="w-full text-left px-1.5 py-1 rounded text-[9px] font-bold text-rose-300 hover:bg-rose-950/80 hover:text-rose-100 border border-transparent hover:border-rose-500/40 transition-all flex items-center space-x-1.5"
                >
                  <Trash2 size={11} className="text-rose-400 shrink-0" />
                  <span>Delete Download</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onPreCache?.(bookId);
                  }}
                  className="w-full text-left px-1.5 py-1 rounded text-[9px] font-bold text-cyan-300 hover:bg-cyan-950/80 hover:text-cyan-100 border border-transparent hover:border-cyan-500/40 transition-all flex items-center space-x-1.5 mt-0.5"
                >
                  <RefreshCw size={11} className="text-cyan-400 shrink-0" />
                  <span>Re-download Book</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* NOT CACHED STATE: Download Badge (Arrow pointing down to a tray) */
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreCache?.(bookId);
            }}
            className="bg-slate-950/90 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/80 hover:border-cyan-200 shadow-lg rounded-md px-1.5 py-0.5 flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
            title="Click to download all 365 daily devotionals for offline reading"
          >
            <Download size={10} className="shrink-0 text-cyan-300 group-hover:text-slate-950" />
            <span className="text-[8px] font-mono font-bold tracking-tight">CACHE</span>
          </button>
        )}
      </div>
    </div>
  );
};

