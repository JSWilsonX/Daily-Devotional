import React from "react";
import { BookOpen, Volume2, Award } from "lucide-react";

interface SidebarProps {
  isSlate: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSlate }) => {
  return (
    <aside 
      id="sidebar-nav" 
      className={`hidden md:flex flex-col items-center justify-between w-20 py-8 z-20 shrink-0 h-screen sticky top-0 border-r ${
        isSlate 
          ? "bg-[#080c14]/80 backdrop-blur-3xl border-white/5" 
          : "bg-[#f4ebd9]/90 backdrop-blur-2xl border-amber-900/10"
      }`}
    >
      <div className="flex flex-col items-center space-y-10">
        {/* Hexagonal branding emblem */}
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
  );
};
