import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TourDefinition, TourState } from "./TourTypes";
import { tours, CURRENT_APP_VERSION } from "./tourConfig";

interface TourContextProps {
  isActive: boolean;
  currentTour: TourDefinition | null;
  currentStepIdx: number;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  locale: string;
  setLocale: (lang: string) => void;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TourState>({
    currentTour: null,
    currentStepIdx: 0,
    isActive: false,
    isCompleted: false,
  });

  const [locale, setLocale] = useState<string>("en");

  // Load locale based on browser preference if not cached
  useEffect(() => {
    const savedLang = localStorage.getItem("egw_locale") || navigator.language.split("-")[0];
    if (savedLang === "es" || savedLang === "en") {
      setLocale(savedLang);
    }
  }, []);

  const saveLocale = (lang: string) => {
    setLocale(lang);
    localStorage.setItem("egw_locale", lang);
  };

  // 1. Core State Operations
  const startTour = useCallback((tourId: string) => {
    const tour = tours.find((t) => t.id === tourId);
    if (!tour) return;

    setState({
      currentTour: tour,
      currentStepIdx: 0,
      isActive: true,
      isCompleted: false,
    });
  }, []);

  // Find the next index that has its selector present in the DOM, or center screen if it is an important step
  const getNextValidStepIdx = useCallback((tour: TourDefinition, startIdx: number, direction: "forward" | "backward"): number => {
    let idx = startIdx;
    while (idx >= 0 && idx < tour.steps.length) {
      const step = tour.steps[idx];
      // Target `#app-root` always exists. For other selectors, verify if they exist in DOM
      if (step.selector === "#app-root" || document.querySelector(step.selector) !== null) {
        return idx;
      }
      // If element is not present, we skip this step! (Conditional Step Handling)
      console.warn(`Tour selector "${step.selector}" not found. Skipping step: "${step.id}"`);
      idx = direction === "forward" ? idx + 1 : idx - 1;
    }
    return -1;
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!prev.currentTour || !prev.isActive) return prev;
      
      const nextIdx = prev.currentStepIdx + 1;
      const validIdx = getNextValidStepIdx(prev.currentTour, nextIdx, "forward");

      if (validIdx === -1 || validIdx >= prev.currentTour.steps.length) {
        // Automatically complete if no more steps
        const lastVer = prev.currentTour.version;
        localStorage.setItem("egw_last_completed_tour_version", lastVer);
        return {
          ...prev,
          isActive: false,
          isCompleted: true,
        };
      }

      return {
        ...prev,
        currentStepIdx: validIdx,
      };
    });
  }, [getNextValidStepIdx]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (!prev.currentTour || !prev.isActive || prev.currentStepIdx === 0) return prev;

      const prevIdx = prev.currentStepIdx - 1;
      const validIdx = getNextValidStepIdx(prev.currentTour, prevIdx, "backward");

      if (validIdx === -1) return prev; // Cannot go backward if no valid steps

      return {
        ...prev,
        currentStepIdx: validIdx,
      };
    });
  }, [getNextValidStepIdx]);

  const skipTour = useCallback(() => {
    setState((prev) => {
      if (prev.currentTour) {
        // Mark current version as handled so they don't get forced again
        localStorage.setItem("egw_last_completed_tour_version", prev.currentTour.version);
      }
      return {
        ...prev,
        isActive: false,
        isCompleted: true,
      };
    });
  }, []);

  const finishTour = useCallback(() => {
    setState((prev) => {
      if (prev.currentTour) {
        localStorage.setItem("egw_last_completed_tour_version", prev.currentTour.version);
      }
      return {
        ...prev,
        isActive: false,
        isCompleted: true,
      };
    });
  }, []);

  // 2. Persistent Version Tracking and Automatic Launch Logic
  useEffect(() => {
    // Delay slightly to let the UI finish initial render/settle
    const timer = setTimeout(() => {
      const lastCompletedVersion = localStorage.getItem("egw_last_completed_tour_version");

      if (lastCompletedVersion === null) {
        // A. FIRST-TIME INSTALLATION: Trigger onboarding tour
        const onboardingTour = tours.find((t) => t.isOnboarding);
        if (onboardingTour) {
          startTour(onboardingTour.id);
        }
      } else if (lastCompletedVersion !== CURRENT_APP_VERSION) {
        // B. UPGRADE/VERSION CHANGED: Automatically find the tour for the new version
        const matchingTour = tours.find((t) => t.version === CURRENT_APP_VERSION && !t.isOnboarding);
        if (matchingTour) {
          startTour(matchingTour.id);
        } else {
          // If no specific update tour exists, just silent-bump the version record
          localStorage.setItem("egw_last_completed_tour_version", CURRENT_APP_VERSION);
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [startTour]);

  return (
    <TourContext.Provider
      value={{
        isActive: state.isActive,
        currentTour: state.currentTour,
        currentStepIdx: state.currentStepIdx,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        finishTour,
        locale,
        setLocale: saveLocale,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
