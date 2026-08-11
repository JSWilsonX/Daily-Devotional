import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TourDefinition, TourStep, TourPlacement } from "./TourTypes";

interface TourOverlayProps {
  tour: TourDefinition;
  stepIdx: number;
  locale?: string; // "en" | "es" etc.
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

export function TourOverlay({
  tour,
  stepIdx,
  locale = "en",
  onNext,
  onPrev,
  onSkip,
  onFinish,
}: TourOverlayProps) {
  const currentStep = tour.steps[stepIdx];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFallbackMoreMenu, setIsFallbackMoreMenu] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [arrowClass, setArrowClass] = useState("");
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [realPlacement, setRealPlacement] = useState<TourPlacement>("auto");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Helper to find visible target or fallback to More Menu button if target is collapsed
  const getVisibleTarget = (selector: string): { element: HTMLElement | null; isFallback: boolean } => {
    if (selector === "#app-root") return { element: null, isFallback: false };

    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { element: el, isFallback: false };
      }
    }

    // Fallback: If primary control is hidden (e.g. collapsed into More Menu on small screens),
    // point to the More Menu button if present and visible
    const moreMenuBtn = document.querySelector<HTMLElement>("#header-more-menu-btn");
    if (moreMenuBtn) {
      const moreRect = moreMenuBtn.getBoundingClientRect();
      if (moreRect.width > 0 && moreRect.height > 0) {
        return { element: moreMenuBtn, isFallback: true };
      }
    }

    return { element: null, isFallback: false };
  };

  // Helper to translate content
  const translate = (field: string | Record<string, string>) => {
    if (typeof field === "string") return field;
    return field[locale] || field["en"] || "";
  };

  const isLastStep = stepIdx === tour.steps.length - 1;

  // 1. Target Tracking: Scroll & Resize listening to keep bounds updated
  useEffect(() => {
    let animationFrameId: number;

    const updateBounds = () => {
      const { element, isFallback } = getVisibleTarget(currentStep.selector);
      setIsFallbackMoreMenu(isFallback);

      if (element) {
        // Scroll target into view if necessary
        const rect = element.getBoundingClientRect();
        const isOffscreen =
          rect.top < 0 ||
          rect.left < 0 ||
          rect.bottom > window.innerHeight ||
          rect.right > window.innerWidth;

        if (isOffscreen) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setTargetRect(element.getBoundingClientRect());
      } else {
        // Fallback to full viewport
        setTargetRect(null);
      }
    };

    updateBounds();

    // Listen to resize, scroll, and layout changes
    window.addEventListener("resize", updateBounds, { passive: true });
    window.addEventListener("scroll", updateBounds, { passive: true });
    
    // Check multiple frames in case scrolling is smooth
    const pollBounds = () => {
      updateBounds();
      animationFrameId = requestAnimationFrame(pollBounds);
    };
    animationFrameId = requestAnimationFrame(pollBounds);

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStep.selector, stepIdx]);

  // 2. Popover Positioning Logic with Viewport Collision Handling
  useEffect(() => {
    if (!popoverRef.current) return;

    const popoverWidth = popoverRef.current.offsetWidth || 340;
    const popoverHeight = popoverRef.current.offsetHeight || 180;
    const padding = 8;
    const arrowSize = 10;
    const margin = padding + arrowSize + 4;

    if (!targetRect) {
      // Center-screen position (fallback or #app-root)
      setPopoverPosition({
        top: Math.max(16, (window.innerHeight - popoverHeight) / 2),
        left: Math.max(16, (window.innerWidth - popoverWidth) / 2),
      });
      setRealPlacement("auto");
      setArrowClass("hidden");
      setArrowStyle({});
      return;
    }

    let preferredPlacement = currentStep.placement || "auto";
    let calculatedTop = 0;
    let calculatedLeft = 0;

    // Determine automatic placement if requested or fallback
    if (preferredPlacement === "auto") {
      const spaceAbove = targetRect.top;
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceLeft = targetRect.left;
      const spaceRight = window.innerWidth - targetRect.right;

      if (spaceBelow >= popoverHeight + margin) {
        preferredPlacement = "bottom";
      } else if (spaceAbove >= popoverHeight + margin) {
        preferredPlacement = "top";
      } else if (spaceRight >= popoverWidth + margin) {
        preferredPlacement = "right";
      } else if (spaceLeft >= popoverWidth + margin) {
        preferredPlacement = "left";
      } else {
        preferredPlacement = "bottom"; // Ultimate fallback
      }
    }

    setRealPlacement(preferredPlacement);

    // Calculate absolute coordinates based on verified placement
    if (preferredPlacement === "bottom") {
      calculatedTop = targetRect.bottom + margin;
      calculatedLeft = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
    } else if (preferredPlacement === "top") {
      calculatedTop = targetRect.top - popoverHeight - margin;
      calculatedLeft = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
    } else if (preferredPlacement === "left") {
      calculatedTop = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
      calculatedLeft = targetRect.left - popoverWidth - margin;
    } else if (preferredPlacement === "right") {
      calculatedTop = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
      calculatedLeft = targetRect.right + margin;
    }

    // Viewport bound-checking to keep bubble in-bounds
    const boundLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, calculatedLeft));
    const boundTop = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, calculatedTop));

    setPopoverPosition({ top: boundTop, left: boundLeft });

    // Arrow pointer positioning relative to the popover boundary shifts
    if (preferredPlacement === "bottom") {
      const arrowX = targetRect.left + (targetRect.width / 2) - boundLeft;
      setArrowClass("absolute -top-2 h-4 w-4 rotate-45 border-t border-l");
      setArrowStyle({ left: `${Math.max(12, Math.min(popoverWidth - 28, arrowX - 8))}px` });
    } else if (preferredPlacement === "top") {
      const arrowX = targetRect.left + (targetRect.width / 2) - boundLeft;
      setArrowClass("absolute -bottom-2 h-4 w-4 rotate-45 border-b border-r");
      setArrowStyle({ left: `${Math.max(12, Math.min(popoverWidth - 28, arrowX - 8))}px` });
    } else if (preferredPlacement === "left") {
      const arrowY = targetRect.top + (targetRect.height / 2) - boundTop;
      setArrowClass("absolute -right-2 h-4 w-4 rotate-45 border-t border-r");
      setArrowStyle({ top: `${Math.max(12, Math.min(popoverHeight - 28, arrowY - 8))}px` });
    } else if (preferredPlacement === "right") {
      const arrowY = targetRect.top + (targetRect.height / 2) - boundTop;
      setArrowClass("absolute -left-2 h-4 w-4 rotate-45 border-b border-l");
      setArrowStyle({ top: `${Math.max(12, Math.min(popoverHeight - 28, arrowY - 8))}px` });
    }
  }, [targetRect, currentStep.placement, stepIdx]);

  // 3. User Interaction Guard: Block all clicks/taps outside the target
  useEffect(() => {
    const selector = currentStep.selector;
    const allowInteraction = !!currentStep.allowInteraction;

    const blockGlobalInputs = (e: MouseEvent) => {
      if (selector === "#app-root" || !targetRect) return;

      const { element } = getVisibleTarget(selector);
      if (element) {
        const clickedInside = element.contains(e.target as Node);
        // If interaction is allowed, and clicked inside the target element, let it pass
        if (allowInteraction && clickedInside) {
          return;
        }

        // Also permit clicks inside our own popover bubble
        if (popoverRef.current?.contains(e.target as Node)) {
          return;
        }
      }

      // Block interaction with everything else
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("click", blockGlobalInputs, true);
    window.addEventListener("mousedown", blockGlobalInputs, true);
    window.addEventListener("mouseup", blockGlobalInputs, true);

    return () => {
      window.removeEventListener("click", blockGlobalInputs, true);
      window.removeEventListener("mousedown", blockGlobalInputs, true);
      window.removeEventListener("mouseup", blockGlobalInputs, true);
    };
  }, [currentStep.selector, targetRect, currentStep.allowInteraction]);

  // 4. Keyboard Shortcuts: Esc to skip, Left to back, Right/Space to next
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      } else if (e.key === "ArrowLeft" && stepIdx > 0) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isLastStep) {
          onFinish();
        } else {
          onNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [stepIdx, isLastStep, onNext, onPrev, onSkip, onFinish]);

  // 5. Accessible Focus Lock (Tab-Trapping inside popover)
  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = popover.querySelectorAll<HTMLElement>(focusableSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element on mount/step change
    if (firstFocusable) firstFocusable.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [stepIdx]);

  // Spotlight dimensions with safe padding offsets
  const padding = 8;
  const spotlightX = targetRect ? targetRect.x - padding : 0;
  const spotlightY = targetRect ? targetRect.y - padding : 0;
  const spotlightW = targetRect ? targetRect.width + padding * 2 : 0;
  const spotlightH = targetRect ? targetRect.height + padding * 2 : 0;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none font-sans">
      {/* 1. Backdrop SVG Mask overlay for elegant visual dimming */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tour-spotlight-svg-mask">
            {/* White represents opaque canvas (fully dimmed background) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            
            {/* Black represents fully transparent cut-out (spotlight highlighting target control) */}
            {targetRect && (
              <rect
                x={spotlightX}
                y={spotlightY}
                width={spotlightW}
                height={spotlightH}
                rx={12}
                ry={12}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Ambient semi-transparent backdrop rectangle */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.72)"
          className="backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
          mask="url(#tour-spotlight-svg-mask)"
        />
      </svg>

      {/* Interactive highlight pointer border glow effect */}
      {targetRect && (
        <div
          className="absolute border-2 border-cyan-400 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300"
          style={{
            top: spotlightY,
            left: spotlightX,
            width: spotlightW,
            height: spotlightH,
          }}
        />
      )}

      {/* 2. Floating popover card */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={popoverRef}
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: popoverPosition.top,
            left: popoverPosition.left,
          }}
          className="w-[calc(100vw-32px)] sm:w-[340px] z-[110] rounded-2xl p-5 border shadow-2xl bg-[#0f172a] border-slate-800 text-slate-100 flex flex-col focus:outline-none pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-heading"
          aria-describedby="tour-explanation"
        >
          {/* Arrow pointing at highlighted control */}
          <div
            className={`${arrowClass} bg-[#0f172a] border-slate-800 transition-all duration-300 pointer-events-none`}
            style={arrowStyle}
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3
              id="tour-heading"
              className="font-bold text-sm leading-snug tracking-tight text-white flex-1"
            >
              {translate(currentStep.title)}
            </h3>
            <button
              onClick={onSkip}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Skip guided tour"
            >
              <X size={15} />
            </button>
          </div>

          {/* Explanation Body */}
          <p
            id="tour-explanation"
            className="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal"
          >
            {(() => {
              const text = translate(currentStep.explanation);
              const parts = text.split(/(\*\*.*?\*\*)/g);
              return parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  const content = part.slice(2, -2);
                  return (
                    <strong
                      key={i}
                      className="font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-500/30 mx-0.5 inline-block shadow-sm"
                    >
                      {content}
                    </strong>
                  );
                }
                return part;
              });
            })()}
          </p>

          {/* More Menu Callout Badge if pointing to More Options button on smaller screens */}
          {isFallbackMoreMenu && (
            <div className="mt-3 text-[11px] font-mono font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm">
              <span className="text-sm shrink-0">📍</span>
              <span className="leading-tight">
                Control located inside the '...' More Options menu
              </span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80">
            {/* Progress Label */}
            <span className="text-[10px] font-mono text-slate-400 font-medium">
              {stepIdx + 1} of {tour.steps.length}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {stepIdx > 0 && (
                <button
                  onClick={onPrev}
                  className="px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <ChevronLeft size={12} />
                  <span>PREV</span>
                </button>
              )}

              {isLastStep ? (
                <button
                  onClick={onFinish}
                  className="px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  FINISH
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <span>NEXT</span>
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
