import React, { useState } from "react";

interface BookCoverProps {
  title: string;
  coverUrl: string;
  active: boolean;
  bookId: string;
}

const THEME_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  mlt: { bg: "from-amber-950 via-amber-900 to-amber-950", border: "border-amber-500/30", accent: "text-amber-300" },
  ohc: { bg: "from-sky-950 via-slate-900 to-sky-950", border: "border-sky-500/30", accent: "text-sky-300" },
  sdg: { bg: "from-red-950 via-red-900 to-red-950", border: "border-red-500/30", accent: "text-red-300" },
  rc: { bg: "from-emerald-950 via-emerald-900 to-emerald-950", border: "border-emerald-500/30", accent: "text-emerald-300" },
  cc: { bg: "from-amber-900 via-stone-800 to-amber-950", border: "border-amber-400/30", accent: "text-amber-200" },
  mar: { bg: "from-purple-950 via-violet-900 to-purple-950", border: "border-violet-500/30", accent: "text-violet-300" },
  tmk: { bg: "from-indigo-950 via-indigo-900 to-indigo-950", border: "border-indigo-500/30", accent: "text-indigo-300" },
  hp: { bg: "from-blue-950 via-cyan-900 to-blue-950", border: "border-cyan-500/30", accent: "text-cyan-300" },
  gag: { bg: "from-rose-950 via-rose-900 to-rose-950", border: "border-rose-400/30", accent: "text-rose-300" },
  tdg: { bg: "from-stone-950 via-stone-900 to-stone-950", border: "border-stone-500/30", accent: "text-stone-300" },
  tblj: { bg: "from-teal-950 via-teal-900 to-teal-950", border: "border-teal-500/30", accent: "text-teal-300" },
  ysrp: { bg: "from-orange-950 via-orange-900 to-orange-950", border: "border-orange-500/30", accent: "text-orange-300" },
  lhu: { bg: "from-yellow-950 via-amber-900 to-yellow-950", border: "border-amber-400/30", accent: "text-amber-200" },
  fw: { bg: "from-zinc-900 via-zinc-800 to-zinc-900", border: "border-zinc-500/30", accent: "text-zinc-300" },
  dbd: { bg: "from-slate-950 via-zinc-900 to-slate-950", border: "border-slate-500/30", accent: "text-slate-300" },
  ul: { bg: "from-red-950 via-stone-900 to-red-950", border: "border-red-400/30", accent: "text-red-300" }
};

export const BookCover: React.FC<BookCoverProps> = ({ title, coverUrl, active, bookId }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
};
