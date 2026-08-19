import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatDateDisplay } from "../utils/date";

interface CalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isSlate: boolean;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  isSlate
}) => {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(() => selectedDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState<number>(() => selectedDate.getMonth());

  const openDatePicker = () => {
    setPickerYear(selectedDate.getFullYear());
    setPickerMonth(selectedDate.getMonth());
    setShowDatePicker(prev => !prev);
  };

  return (
    <div className="relative shrink-0" id="calendar-date-container">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            onSelectDate(prev);
          }}
          className={`p-1 rounded-xl border transition-all ${
            isSlate 
              ? "bg-slate-900/50 border-white/5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800" 
              : "bg-amber-50 border-amber-900/10 text-stone-700 hover:text-amber-800 hover:bg-amber-100"
          }`}
          title="Previous Day"
        >
          <ChevronLeft size={12} />
        </button>

        <button
          id="header-calendar-button"
          type="button"
          onClick={openDatePicker}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl border text-xs font-mono font-medium transition-all ${
            isSlate 
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.12)]" 
              : "bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200/80"
          }`}
          title="Select Devotional Date"
        >
          <Calendar size={12} className="shrink-0 text-cyan-400" />
          <span className="font-bold tracking-tight">{formatDateDisplay(selectedDate)}</span>
        </button>

        <button
          onClick={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            onSelectDate(next);
          }}
          className={`p-1 rounded-xl border transition-all ${
            isSlate 
              ? "bg-slate-900/50 border-white/5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800" 
              : "bg-amber-50 border-amber-900/10 text-stone-700 hover:text-amber-800 hover:bg-amber-100"
          }`}
          title="Next Day"
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Interactive Calendar Popover Modal */}
      {showDatePicker && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
            onClick={() => setShowDatePicker(false)} 
          />

          <div 
            className={`absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] p-3.5 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isSlate 
                ? "bg-slate-950 border-cyan-500/30 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.9)]" 
                : "bg-amber-50 border-amber-900/20 text-stone-800 shadow-[0_10px_35px_rgba(0,0,0,0.2)]"
            }`}
          >
            {/* Calendar Popover Top Bar */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-700/30">
              <div className="flex items-center space-x-1.5">
                <Calendar size={13} className={isSlate ? "text-cyan-400" : "text-amber-800"} />
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider">
                  Select Date
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className={`p-1 rounded-lg transition-all ${
                  isSlate 
                    ? "hover:bg-slate-800 text-slate-400 hover:text-white" 
                    : "hover:bg-amber-200/60 text-stone-600 hover:text-stone-900"
                }`}
                title="Close Calendar"
              >
                <X size={14} />
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 0) {
                    setPickerMonth(11);
                    setPickerYear(y => y - 1);
                  } else {
                    setPickerMonth(m => m - 1);
                  }
                }}
                className={`p-1 rounded-lg border transition-all ${
                  isSlate ? "bg-slate-900 border-white/10 hover:border-cyan-400 text-slate-300" : "bg-white border-amber-900/20 hover:border-amber-600 text-stone-700"
                }`}
                title="Previous Month"
              >
                <ChevronLeft size={13} />
              </button>

              <div className="flex items-center space-x-1.5">
                {/* Month Selector Dropdown */}
                <select
                  value={pickerMonth}
                  onChange={(e) => setPickerMonth(Number(e.target.value))}
                  className={`text-xs font-bold font-mono px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                    isSlate ? "bg-slate-900 border-cyan-500/30 text-cyan-300" : "bg-white border-amber-900/20 text-amber-900"
                  }`}
                >
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((mName, idx) => (
                    <option key={mName} value={idx}>{mName}</option>
                  ))}
                </select>

                {/* Year Selector Dropdown */}
                <select
                  value={pickerYear}
                  onChange={(e) => setPickerYear(Number(e.target.value))}
                  className={`text-xs font-bold font-mono px-1.5 py-1 rounded-lg border outline-none cursor-pointer ${
                    isSlate ? "bg-slate-900 border-cyan-500/30 text-cyan-300" : "bg-white border-amber-900/20 text-amber-900"
                  }`}
                >
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 11) {
                    setPickerMonth(0);
                    setPickerYear(y => y + 1);
                  } else {
                    setPickerMonth(m => m + 1);
                  }
                }}
                className={`p-1 rounded-lg border transition-all ${
                  isSlate ? "bg-slate-900 border-white/10 hover:border-cyan-400 text-slate-300" : "bg-white border-amber-900/20 hover:border-amber-600 text-stone-700"
                }`}
                title="Next Month"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Weekday Header Labels */}
            <div className="grid grid-cols-7 text-center mb-1 text-[10px] font-mono font-bold uppercase opacity-60">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Days Grid */}
            {(() => {
              const firstDayIndex = new Date(pickerYear, pickerMonth, 1).getDay();
              const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
              const today = new Date();

              return (
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-7" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const isSelected = 
                      selectedDate.getFullYear() === pickerYear &&
                      selectedDate.getMonth() === pickerMonth &&
                      selectedDate.getDate() === day;

                    const isToday = 
                      today.getFullYear() === pickerYear &&
                      today.getMonth() === pickerMonth &&
                      today.getDate() === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          onSelectDate(new Date(pickerYear, pickerMonth, day));
                          setShowDatePicker(false);
                        }}
                        className={`h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative ${
                          isSelected
                            ? isSlate 
                              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20" 
                              : "bg-amber-800 text-amber-50 font-bold shadow-md"
                            : isSlate
                              ? "hover:bg-cyan-500/20 text-slate-200"
                              : "hover:bg-amber-200/60 text-stone-800"
                        } ${isToday && !isSelected ? (isSlate ? "ring-1 ring-cyan-400/60 text-cyan-300 font-bold" : "ring-1 ring-amber-700 text-amber-900 font-bold") : ""}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Quick Action Footer */}
            <div className="mt-3 pt-2 border-t border-slate-700/30 flex justify-center text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  onSelectDate(today);
                  setPickerYear(today.getFullYear());
                  setPickerMonth(today.getMonth());
                  setShowDatePicker(false);
                }}
                className={`w-full py-1.5 rounded-lg border font-semibold text-center transition-all ${
                  isSlate 
                    ? "bg-slate-900 border-white/10 text-slate-300 hover:text-cyan-400 hover:bg-slate-800" 
                    : "bg-white border-amber-900/15 text-stone-700 hover:text-amber-900 hover:bg-amber-100/60"
                }`}
              >
                📅 Reset to Today
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
