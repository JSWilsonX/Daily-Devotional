import React from "react";
import { Play, Pause, Square, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Devotional, DevotionalContent } from "../types";

interface TTSPlayerProps {
  content: DevotionalContent | null;
  selectedDevotional: Devotional | null;
  isPlaying: boolean;
  isPaused: boolean;
  activeParagraphIdx: number;
  speechRate: number;
  speechPitch: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  isSlate: boolean;
  onStartSpeech: () => void;
  onPauseSpeech: () => void;
  onStopSpeech: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSelectVoiceName: (voiceName: string) => void;
  onSetSpeechRate: (rate: number) => void;
  onSpeakParagraph: (idx: number) => void;
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({
  content,
  selectedDevotional,
  isPlaying,
  isPaused,
  activeParagraphIdx,
  speechRate,
  voices,
  selectedVoiceName,
  isSlate,
  onStartSpeech,
  onPauseSpeech,
  onStopSpeech,
  onSkipForward,
  onSkipBackward,
  onSelectVoiceName,
  onSetSpeechRate,
  onSpeakParagraph
}) => {
  return (
    <footer 
      id="audio-playback-dock"
      className={`fixed bottom-0 left-0 md:left-20 right-0 p-4 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] z-50 transition-all ${
        isSlate 
          ? "bg-slate-950/90 backdrop-blur-3xl border-t border-white/10" 
          : "bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-amber-900/10"
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-row items-center justify-between gap-2 md:gap-4 flex-nowrap overflow-x-auto no-scrollbar">
        
        {/* Left Column: Book Cover Image only */}
        <div className="flex items-center justify-center flex-shrink-0">
          <div className={`w-9 h-12 rounded-md overflow-hidden shadow-sm flex items-center justify-center border ${
            isSlate ? "bg-slate-900 border-white/10" : "bg-amber-50 border-amber-900/10"
          }`}>
            {selectedDevotional?.cover ? (
              <img 
                src={selectedDevotional.cover} 
                alt="cover" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-[10px] font-bold text-cyan-400 font-mono">
                {(selectedDevotional?.id || "EGW").toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Middle Column: Player Controls */}
        <div className="flex flex-row items-center gap-2 sm:gap-4 flex-grow justify-center min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Skip back */}
            <button
              id="btn-skip-backward"
              onClick={onSkipBackward}
              disabled={!content || activeParagraphIdx <= 0}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                isSlate 
                  ? "bg-slate-900/40 border-white/5 text-cyan-400 hover:bg-slate-800 disabled:opacity-25" 
                  : "bg-amber-50 border-amber-900/5 text-amber-800 hover:bg-amber-100 disabled:opacity-25"
              }`}
              title="Previous paragraph"
            >
              <SkipBack size={13} />
            </button>

            {/* Play / Pause Toggle with custom glow shadows */}
            {isPlaying ? (
              <button
                id="btn-pause-speech"
                onClick={onPauseSpeech}
                disabled={!content}
                className={`p-2 sm:p-2.5 rounded-full shadow-md transition-all transform hover:scale-105 disabled:opacity-25 ${
                  isSlate 
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-white shadow-cyan-400/25" 
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
                title="Pause speech synthesis"
              >
                <Pause size={15} fill="currentColor" />
              </button>
            ) : (
              <button
                id="btn-play-speech"
                onClick={onStartSpeech}
                disabled={!content}
                className={`p-2 sm:p-2.5 rounded-full shadow-md transition-all transform hover:scale-105 disabled:opacity-25 ${
                  isSlate 
                    ? "bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-95 text-white shadow-cyan-500/20 glow-cyan" 
                    : "bg-amber-700 hover:bg-amber-800 text-white"
                }`}
                title="Play vocal stream"
              >
                <Play size={15} fill="currentColor" />
              </button>
            )}

            {/* Stop Block */}
            <button
              id="btn-stop-speech"
              onClick={onStopSpeech}
              disabled={!content || (!isPlaying && !isPaused && activeParagraphIdx === -1)}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                isSlate 
                  ? "bg-slate-900/40 border-white/5 text-red-400 hover:bg-red-500/10 disabled:opacity-25" 
                  : "bg-red-100 border-red-900/5 text-red-700 hover:bg-red-200 disabled:opacity-25"
              }`}
              title="Stop vocal stream"
            >
              <Square size={11} fill="currentColor" />
            </button>

            {/* Skip forward */}
            <button
              id="btn-skip-forward"
              onClick={onSkipForward}
              disabled={!content || activeParagraphIdx === -1 || activeParagraphIdx >= (content?.paragraphs?.length || 0) - 1}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                isSlate 
                  ? "bg-slate-900/40 border-white/5 text-cyan-400 hover:bg-slate-800 disabled:opacity-25" 
                  : "bg-amber-50 border-amber-900/5 text-amber-800 hover:bg-amber-100 disabled:opacity-25"
              }`}
              title="Next paragraph"
            >
              <SkipForward size={13} />
            </button>
          </div>

          {/* Progress track */}
          {content && content.paragraphs && content.paragraphs.length > 0 ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 w-16 xs:w-28 sm:w-44 md:w-60 flex-shrink min-w-0">
              <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 text-right flex-shrink-0">
                {activeParagraphIdx !== -1 ? activeParagraphIdx + 1 : 0}
              </span>
              <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden relative min-w-[30px]">
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
              <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 flex-shrink-0">
                {content.paragraphs.length}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 w-16 xs:w-28 sm:w-44 md:w-60 opacity-30 flex-shrink min-w-0">
              <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 text-right flex-shrink-0">0</span>
              <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden relative min-w-[30px]">
                <div className="absolute top-0 bottom-0 left-0 w-0"></div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 w-4 sm:w-5 flex-shrink-0">0</span>
            </div>
          )}
        </div>

        {/* Right Column: Speed / Voice Selection */}
        <div className="flex flex-row items-center gap-1.5 sm:gap-3 flex-shrink-0">
          
          {/* Voice presets dropdown */}
          {voices.length > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <Volume2 size={12} className={isSlate ? "text-cyan-400" : "text-amber-800"} />
              <select
                id="voice-select"
                value={selectedVoiceName}
                onChange={(e) => {
                  const val = e.target.value;
                  onSelectVoiceName(val);
                  if (isPlaying) {
                    onSpeakParagraph(activeParagraphIdx);
                  }
                }}
                disabled={!content}
                className={`text-[10px] sm:text-xs rounded-lg border p-1 sm:p-1.5 font-sans focus:ring-1 focus:ring-cyan-400 outline-none disabled:opacity-50 max-w-[80px] xs:max-w-[120px] ${
                  isSlate 
                    ? "bg-slate-900 border-white/10 text-slate-200 focus:border-cyan-400" 
                    : "bg-amber-50 border-amber-900/10 text-stone-800 focus:border-amber-600"
                }`}
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {(v.name || "").replace("Google", "").replace("Microsoft", "").trim()} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speed configuration */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <span className={`text-[8px] sm:text-[9px] font-mono uppercase tracking-wider font-bold ${isSlate ? "text-cyan-400" : "text-amber-800"} hidden xs:inline`}>Speed:</span>
            <select
              id="rate-select"
              value={String(speechRate)}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                onSetSpeechRate(rate);
                if (isPlaying) {
                  onSpeakParagraph(activeParagraphIdx);
                }
              }}
              disabled={!content}
              className={`text-[10px] sm:text-xs rounded-lg border p-1 sm:p-1.5 font-mono focus:ring-1 focus:ring-cyan-400 outline-none disabled:opacity-50 ${
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
  );
};
