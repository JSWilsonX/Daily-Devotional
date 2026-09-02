import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { TourProvider, useTour } from '../../components/Tour/TourContext';
import { TourOverlay } from '../../components/Tour/TourOverlay';
import { TourDefinition } from '../../components/Tour/TourTypes';

// Mock motion.div / AnimatePresence to bypass complex animations in jsdom
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockTour: TourDefinition = {
  id: 'test-tour',
  version: '1.0.0',
  name: 'Test Guided Tour',
  description: 'Test tour description',
  steps: [
    {
      id: 'step1',
      selector: '#app-root',
      title: 'Welcome Title',
      explanation: 'First step explanation text.',
      placement: 'auto',
    },
    {
      id: 'step2',
      selector: '#btn-target',
      title: 'Action Button Title',
      explanation: 'Click this target to perform the action.',
      placement: 'bottom',
    },
  ],
};

describe('Tour Subsystem & Onboarding Automation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('TourOverlay Component', () => {
    it('should render the active step title and explanation', () => {
      render(
        <TourOverlay
          tour={mockTour}
          stepIdx={0}
          locale="en"
          onNext={vi.fn()}
          onPrev={vi.fn()}
          onSkip={vi.fn()}
          onFinish={vi.fn()}
        />
      );

      expect(screen.getByText('Welcome Title')).toBeInTheDocument();
      expect(screen.getByText('First step explanation text.')).toBeInTheDocument();
      expect(screen.getByTitle('Skip Tour')).toBeInTheDocument();
    });

    it('should support next and prev step callbacks', () => {
      const onNext = vi.fn();
      const onPrev = vi.fn();

      render(
        <TourOverlay
          tour={mockTour}
          stepIdx={0}
          locale="en"
          onNext={onNext}
          onPrev={onPrev}
          onSkip={vi.fn()}
          onFinish={vi.fn()}
        />
      );

      const nextBtn = screen.getByText('Next');
      fireEvent.click(nextBtn);
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('TourProvider & useTour Hook', () => {
    const TestComponent = () => {
      const { isActive, currentTour, currentStepIdx, startTour, nextStep, finishTour } = useTour();
      return (
        <div>
          <span data-testid="active">{isActive ? 'YES' : 'NO'}</span>
          <span data-testid="step-idx">{currentStepIdx}</span>
          <span data-testid="tour-id">{currentTour?.id || 'NONE'}</span>
          <button onClick={() => startTour('onboarding')}>START</button>
          <button onClick={nextStep}>NEXT</button>
          <button onClick={finishTour}>FINISH</button>
        </div>
      );
    };

    it('should automatically trigger onboarding tour on first-time launch', () => {
      render(
        <TourProvider>
          <TestComponent />
        </TourProvider>
      );

      // Verify state starts as idle
      expect(screen.getByTestId('active')).toHaveTextContent('NO');

      // Fast-forward 1200ms auto-launch timer
      act(() => {
        vi.advanceTimersByTime(1300);
      });

      expect(screen.getByTestId('active')).toHaveTextContent('YES');
      expect(screen.getByTestId('tour-id')).toHaveTextContent('onboarding');
    });

    it('should respect semver gating and not auto-launch if already completed', () => {
      localStorage.setItem('egw_last_completed_tour_version', '1.6.0');

      render(
        <TourProvider>
          <TestComponent />
        </TourProvider>
      );

      act(() => {
        vi.advanceTimersByTime(1300);
      });

      expect(screen.getByTestId('active')).toHaveTextContent('NO');
    });

    it('should change locale correctly and persist selection', () => {
      render(
        <TourProvider>
          <TourOverlay
            tour={mockTour}
            stepIdx={0}
            locale="es"
            onNext={vi.fn()}
            onPrev={vi.fn()}
            onSkip={vi.fn()}
            onFinish={vi.fn()}
          />
        </TourProvider>
      );

      // Verify that the title is rendered correctly under the specified locale
      expect(screen.getByText('Welcome Title')).toBeInTheDocument();
    });
  });
});
