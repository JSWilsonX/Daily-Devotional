import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TourDefinition, TourStep, TourPlacement } from "./TourTypes";
import { FormattedTourText } from "./FormattedTourText";

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

    // Listen to resize and scroll
    window.addEventListener("resize", updateBounds, { passive: true });
    window.addEventListener("scroll", updateBounds, { passive: true });

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
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
    return () => window.removeEventListener("click", blockGlobalInputs, true);
  }, [currentStep.selector, currentStep.allowInteraction, targetRect]);

  // 4. Keyboard Shortcuts: Escape to exit, Arrows to step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      } else if (e.key === "ArrowRight") {
        if (!isLastStep) onNext();
        else onFinish();
      } else if (e.key === "ArrowLeft" && stepIdx > 0) {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLastStep, onFinish, onNext, onPrev, onSkip, stepIdx]);

  // Padding buffer for the spotlight bounding box
  const pad = 6;
  const spotlightX = targetRect ? Math.max(0, targetRect.left - pad) : 0;
  const spotlightY = targetRect ? Math.max(0, targetRect.top - pad) : 0;
  const spotlightW = targetRect ? targetRect.width + pad * 2 : 0;
  const spotlightH = targetRect ? targetRect.height + pad * 2 : 0;
  const spotlightR = 12;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans pointer-events-auto">
      {/* Dynamic SVG Spotlight Backdrop with Smooth Smooth Transition */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="spotlight-mask">
            {/* White covers entire screen (opaque) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight hole for the active target */}
            {targetRect && (
              <rect
                x={spotlightX}
                y={spotlightY}
                width={spotlightW}
                height={spotlightH}
                rx={spotlightR}
                ry={spotlightR}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        {/* Dark Backdrop with mask applied */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.78)"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-[2px] pointer-events-auto"
        />
      </svg>

      {/* Target Glowing Ring Outline */}
      {targetRect && (
        <motion.div
          initial={false}
          animate={{
            top: spotlightY,
            left: spotlightX,
            width: spotlightW,
            height: spotlightH,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute rounded-xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] pointer-events-none z-50"
        />
      )}

      {/* Interactive Floating Popover Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{
            opacity: 1,
            scale: 1,
            top: popoverPosition.top,
            left: popoverPosition.left,
          }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute" }}
          className="w-80 sm:w-96 rounded-2xl border border-white/15 bg-slate-950/95 text-slate-100 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 pointer-events-auto"
        >
          {/* Subtle Pointer Arrow */}
          {targetRect && (
            <div
              className={`${arrowClass} border-white/15 bg-slate-950`}
              style={arrowStyle}
            />
          )}

          {/* Popover Header: Title & Close Action */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                {stepIdx + 1}
              </span>
              <h3 className="font-display text-sm font-bold text-cyan-300 tracking-tight">
                {translate(currentStep.title)}
              </h3>
            </div>
            <button
              onClick={onSkip}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title="Skip Tour"
            >
              <X size={14} />
            </button>
          </div>

          {/* Collapsed Target Notice (if pointing to more menu) */}
          {isFallbackMoreMenu && (
            <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono leading-tight">
              Note: This tool is nested inside the <strong>More Menu (•••)</strong> on this screen size.
            </div>
          )}

          {/* Body Content */}
          <div className="mb-5">
            <FormattedTourText text={translate(currentStep.explanation)} />
          </div>

          {/* Interactive Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {/* Step Progress Bullets */}
            <div className="flex items-center space-x-1.5">
              {tour.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === stepIdx
                      ? "w-5 bg-gradient-to-r from-cyan-400 to-blue-400"
                      : idx < stepIdx
                      ? "w-1.5 bg-cyan-600/50"
                      : "w-1.5 bg-slate-800"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {stepIdx > 0 && (
                <button
                  onClick={onPrev}
                  className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-mono font-medium transition-all flex items-center space-x-1"
                >
                  <ChevronLeft size={12} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={isLastStep ? onFinish : onNext}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white shadow-lg shadow-cyan-500/20 text-xs font-mono font-bold transition-all flex items-center space-x-1"
              >
                <span>{isLastStep ? "Finish" : "Next"}</span>
                {!isLastStep && <ChevronRight size={12} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
