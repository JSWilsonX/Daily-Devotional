export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export interface TourStep {
  id: string;
  selector: string;
  title: string | Record<string, string>; // Supports plain string or locale-specific string dict
  explanation: string | Record<string, string>; // Supports plain string or locale-specific string dict
  placement?: TourPlacement;
  allowInteraction?: boolean;
  onBeforeAction?: string; // Optional action identifier to run custom setup in TourManager
  onAfterAction?: string; // Optional action identifier to run custom cleanup in TourManager
}

export interface TourDefinition {
  id: string;
  version: string;
  name: string | Record<string, string>;
  description?: string | Record<string, string>;
  steps: TourStep[];
  isOnboarding?: boolean; // If true, shown on first-time install (i.e. empty version cache)
}

export interface TourState {
  currentTour: TourDefinition | null;
  currentStepIdx: number;
  isActive: boolean;
  isCompleted: boolean;
}
