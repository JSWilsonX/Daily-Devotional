import React from "react";
import { useTour } from "./TourContext";
import { TourOverlay } from "./TourOverlay";

export const TourManager: React.FC = () => {
  const {
    isActive,
    currentTour,
    currentStepIdx,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    locale,
  } = useTour();

  if (!isActive || !currentTour) return null;

  return (
    <TourOverlay
      tour={currentTour}
      stepIdx={currentStepIdx}
      locale={locale}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTour}
      onFinish={finishTour}
    />
  );
};
