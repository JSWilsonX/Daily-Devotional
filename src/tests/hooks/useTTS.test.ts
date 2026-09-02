import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTTS } from '../../hooks/useTTS';
import { DevotionalContent } from '../../types';

const mockDevotionalContent: DevotionalContent = {
  title: 'Walking in the Light',
  paragraphs: [
    {
      id: 'p_1',
      type: 'scripture',
      text: 'Thy word is a lamp unto my feet. (Psalm 119:105)',
      pronunciationOverrides: [],
    },
    {
      id: 'p_2',
      type: 'body',
      text: 'We must live each moment in faith, for we live in His grace.',
      pronunciationOverrides: [
        {
          text: 'live',
          occurrence: 1,
          token: 'LIVE_VERB',
        },
      ],
    },
  ],
};

describe('useTTS Hook & Audio Synthesis Engine (FR-4 & Workflow 4)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize in an idle state', () => {
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
      })
    );

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.activeParagraphIdx).toBe(-1);
  });

  it('should start speech and verbalize scripture and phonetic tokens', async () => {
    const onCompleteReading = vi.fn();
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
        onCompleteReading,
      })
    );

    act(() => {
      result.current.startSpeech();
    });

    expect(result.current.isPlaying).toBe(true);

    // useTTS calls speak inside a 30ms setTimeout, verify after delay
    await new Promise((r) => setTimeout(r, 60));
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('should allow pausing and resuming speech playback', () => {
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
      })
    );

    act(() => {
      result.current.startSpeech();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.pauseSpeech();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.startSpeech();
    });
    expect(result.current.isPaused).toBe(false);
  });

  it('should stop speech and reset indices', () => {
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
      })
    );

    act(() => {
      result.current.startSpeech();
    });

    act(() => {
      result.current.stopSpeech();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.activeParagraphIdx).toBe(-1);
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('should skip forward and backward between paragraphs', () => {
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
      })
    );

    act(() => {
      result.current.startSpeech();
    });

    // Skip forward to next paragraph
    act(() => {
      result.current.skipForward();
    });
    expect(result.current.activeParagraphIdx).toBe(1);

    // Skip backward to first paragraph
    act(() => {
      result.current.skipBackward();
    });
    expect(result.current.activeParagraphIdx).toBe(0);
  });

  it('should apply voice settings for profile archetypes (classic vs kids_primary)', () => {
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
      })
    );

    act(() => {
      result.current.applyProfileVoiceSettings('classic');
    });
    expect(result.current.speechRate).toBe(0.85);
    expect(result.current.speechPitch).toBe(0.85);

    act(() => {
      result.current.applyProfileVoiceSettings('kids_primary');
    });
    expect(result.current.speechPitch).toBe(1.1);
  });

  it('should persist user selected voice name to localStorage', () => {
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
      })
    );

    act(() => {
      result.current.setSelectedVoiceName('Microsoft David Desktop - English (United States)');
    });

    expect(result.current.selectedVoiceName).toBe('Microsoft David Desktop - English (United States)');
    expect(localStorage.getItem('egw_selected_voice_name')).toBe('Microsoft David Desktop - English (United States)');
  });

  it('should auto-advance sequentially and call completion callback when finished', async () => {
    const onCompleteReading = vi.fn();
    const { result } = renderHook(() =>
      useTTS({
        content: mockDevotionalContent,
        onCompleteReading,
      })
    );

    act(() => {
      result.current.startSpeech();
    });

    expect(result.current.isPlaying).toBe(true);

    // Wait for setTimeouts in setup speak (10ms each paragraph) and useTTS speakParagraph (30ms start delay) to complete
    await new Promise((r) => setTimeout(r, 150));

    // After sequential execution of both paragraphs, isPlaying should become false and onCompleteReading is called
    expect(result.current.isPlaying).toBe(false);
    expect(onCompleteReading).toHaveBeenCalledTimes(1);
  });
});
