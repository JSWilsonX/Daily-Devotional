import React, { useState } from "react";
import { 
  Download, 
  Check, 
  Sparkles, 
  Sun, 
  Moon, 
  MoreHorizontal, 
  WifiOff, 
  Flame 
} from "lucide-react";
import { ProjectIcon } from "./ProjectIcon";
import { CalendarPicker } from "./CalendarPicker";
import { DEVOTIONAL_PROFILES } from "../config/devotionals";

interface HeaderProps {
  isSlate: boolean;
  isOnline: boolean;
  isAppInstalled: boolean;
  onInstallPWA: () => void;
  onStartTour: () => void;
  onToggleTheme: () => void;
  selectedProfile: string;
  onSelectProfile: (profile: string) => void;
  streakCount: number;
  hasCompletedToday: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSlate,
  isOnline,
  isAppInstalled,
  onInstallPWA,
  onStartTour,
  onToggleTheme,
  selectedProfile,
  onSelectProfile,
  streakCount,
  hasCompletedToday,
  selectedDate,
  onSelectDate
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  return (
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
                onClick={onInstallPWA}
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
                id="replay-tour-btn"
                onClick={onStartTour}
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
                onClick={onToggleTheme}
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
                          onInstallPWA();
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
                          onStartTour();
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
                          onToggleTheme();
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
              onChange={(e) => onSelectProfile(e.target.value)}
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
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            isSlate={isSlate}
          />
        </div>
      </div>
    </header>
  );
};
