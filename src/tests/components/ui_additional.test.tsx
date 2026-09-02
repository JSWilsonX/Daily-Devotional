import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TTSPlayer } from '../../components/TTSPlayer';
import { CalendarPicker } from '../../components/CalendarPicker';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { ProjectIcon } from '../../components/ProjectIcon';
import { DevotionalContent } from '../../types';

describe('Additional UI Component Tests', () => {
  describe('TTSPlayer Component', () => {
    const mockContent: DevotionalContent = {
      title: 'A Clean Heart',
      paragraphs: [
        { id: 'p_1', type: 'body', text: 'Text paragraphs', pronunciationOverrides: [] },
        { id: 'p_2', type: 'body', text: 'Second paragraph', pronunciationOverrides: [] }
      ]
    };

    it('should render playback dock, interact with buttons, and display active status', () => {
      const onStartSpeech = vi.fn();
      const onPauseSpeech = vi.fn();
      const onStopSpeech = vi.fn();
      const onSkipForward = vi.fn();
      const onSkipBackward = vi.fn();

      render(
        <TTSPlayer
          content={mockContent}
          selectedDevotional={{ id: 'ohc', title: 'Our High Calling', cover: 'https://cover.jpg', link: 'link', description: 'desc' }}
          isPlaying={false}
          isPaused={false}
          activeParagraphIdx={0}
          speechRate={1.0}
          speechPitch={1.0}
          voices={[{ name: 'Voice A', lang: 'en-US', default: true } as any]}
          selectedVoiceName="Voice A"
          isSlate={true}
          onStartSpeech={onStartSpeech}
          onPauseSpeech={onPauseSpeech}
          onStopSpeech={onStopSpeech}
          onSkipForward={onSkipForward}
          onSkipBackward={onSkipBackward}
          onSelectVoiceName={vi.fn()}
          onSetSpeechRate={vi.fn()}
          onSpeakParagraph={vi.fn()}
        />
      );

      const playBtn = screen.getByTitle('Play vocal stream');
      fireEvent.click(playBtn);
      expect(onStartSpeech).toHaveBeenCalled();

      const skipFwdBtn = screen.getByTitle('Next paragraph');
      fireEvent.click(skipFwdBtn);
      expect(onSkipForward).toHaveBeenCalled();
    });
  });

  describe('CalendarPicker Component', () => {
    it('should render date picker and trigger popover actions', () => {
      const onSelectDate = vi.fn();
      const date = new Date(2026, 8, 1);

      render(
        <CalendarPicker
          selectedDate={date}
          onSelectDate={onSelectDate}
          isSlate={true}
        />
      );

      const triggerBtn = screen.getByTitle('Select Devotional Date');
      expect(triggerBtn).toHaveTextContent('Sep 1');

      fireEvent.click(triggerBtn);
      expect(screen.getByText(/Reset to Today/i)).toBeInTheDocument();

      const resetBtn = screen.getByText(/Reset to Today/i);
      fireEvent.click(resetBtn);
      expect(onSelectDate).toHaveBeenCalled();
    });
  });

  describe('Header Component', () => {
    it('should render brand name, streak, and trigger style change and installation', () => {
      const onInstallPWA = vi.fn();
      const onStartTour = vi.fn();
      const onToggleTheme = vi.fn();
      const onSelectProfile = vi.fn();

      render(
        <Header
          isSlate={true}
          isOnline={true}
          isAppInstalled={false}
          onInstallPWA={onInstallPWA}
          onStartTour={onStartTour}
          onToggleTheme={onToggleTheme}
          selectedProfile="clear_modern"
          onSelectProfile={onSelectProfile}
          streakCount={5}
          hasCompletedToday={true}
          selectedDate={new Date(2026, 8, 1)}
          onSelectDate={vi.fn()}
        />
      );

      expect(screen.getByText('Ellen G. White Devotionals')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'easy_reading' } });
      expect(onSelectProfile).toHaveBeenCalledWith('easy_reading');

      const installBtn = screen.getByTitle('Install PWA App');
      fireEvent.click(installBtn);
      expect(onInstallPWA).toHaveBeenCalled();
    });
  });

  describe('Sidebar Component', () => {
    it('should render and provide navigational click targets', () => {
      render(<Sidebar isSlate={true} />);
      expect(screen.getByTitle('Focus Reading Pane')).toBeInTheDocument();
      expect(screen.getByTitle('Voice Presets')).toBeInTheDocument();
      expect(screen.getByTitle('Telemetry Status')).toBeInTheDocument();
    });
  });

  describe('ProjectIcon Component', () => {
    it('should render with correct SVG dimensions', () => {
      const { container } = render(<ProjectIcon size={40} className="custom-class" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '40');
      expect(svg).toHaveClass('custom-class');
    });
  });
});
