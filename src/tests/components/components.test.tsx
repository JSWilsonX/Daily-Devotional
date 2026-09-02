import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCover } from '../../components/BookCover';
import { ReaderPanel } from '../../components/ReaderPanel';
import { CacheProgressBanner } from '../../components/CacheProgressBanner';
import { DevotionalContent } from '../../types';

describe('UI Component Integration & Behavioral Contracts', () => {
  describe('BookCover Component (FR-1 & Procedural Fallbacks)', () => {
    it('should render the book cover image when valid', () => {
      render(
        <BookCover
          title="Our High Calling"
          coverUrl="https://media2.egwwritings.org/covers/81_s.jpg"
          active={false}
          bookId="ohc"
          isCachedOffline={false}
          isReadToday={false}
        />
      );

      const img = screen.getByAltText('Our High Calling');
      expect(img).toBeInTheDocument();
    });

    it('should show procedural dual-tone fallback if image triggers error', () => {
      render(
        <BookCover
          title="Our High Calling"
          coverUrl="https://invalid-url.com/broken.jpg"
          active={false}
          bookId="ohc"
          isCachedOffline={false}
          isReadToday={false}
        />
      );

      const img = screen.getByAltText('Our High Calling');
      fireEvent.error(img);

      expect(screen.getByText('OHC')).toBeInTheDocument();
    });

    it('should display "CACHED" badge when book is cached locally (FR-7 & FR-9)', () => {
      render(
        <BookCover
          title="Our High Calling"
          coverUrl="https://media2.egwwritings.org/covers/81_s.jpg"
          active={false}
          bookId="ohc"
          isCachedOffline={true}
          isReadToday={false}
        />
      );

      expect(screen.getByText(/CACHED/i)).toBeInTheDocument();
    });
  });

  describe('ReaderPanel Component (FR-3, FR-5, Workflow 1)', () => {
    const mockContent: DevotionalContent = {
      title: 'A Clean Heart',
      paragraphs: [
        {
          id: 'p_1',
          type: 'scripture',
          text: 'Create in me a clean heart, O God.',
          pronunciationOverrides: [],
        },
        {
          id: 'p_2',
          type: 'body',
          text: 'Living in continuous alignment with higher standards...',
          pronunciationOverrides: [],
        },
      ],
    };

    it('should render devotional title and paragraphs', () => {
      const mockRefs = { current: {} };
      render(
        <ReaderPanel
          content={mockContent}
          isLoadingContent={false}
          contentError={null}
          selectedProfile="clear_modern"
          selectedDevotional={{
            id: 'ohc',
            title: 'Our High Calling',
            cover: 'https://media2.egwwritings.org/covers/81_s.jpg',
            link: 'https://whiteestate.org/devotional/ohc/',
            description: 'Sample description',
          }}
          selectedId="ohc"
          isSlate={true}
          subTextStyle="text-slate-400"
          activeParagraphIdx={-1}
          paragraphRefs={mockRefs}
          hasCompletedToday={false}
          streakCount={0}
          isBookReadToday={() => false}
          onRetryFetch={vi.fn()}
          onCompleteReading={vi.fn()}
          onResetBookStatus={vi.fn()}
        />
      );

      expect(screen.getByText('A Clean Heart')).toBeInTheDocument();
      expect(screen.getByText('Create in me a clean heart, O God.')).toBeInTheDocument();
      expect(screen.getByText('MARK COMPLETED')).toBeInTheDocument();
    });

    it('should trigger onCompleteReading when clicking MARK COMPLETED', () => {
      const onCompleteReading = vi.fn();
      const mockRefs = { current: {} };
      render(
        <ReaderPanel
          content={mockContent}
          isLoadingContent={false}
          contentError={null}
          selectedProfile="clear_modern"
          selectedDevotional={{
            id: 'ohc',
            title: 'Our High Calling',
            cover: 'https://media2.egwwritings.org/covers/81_s.jpg',
            link: 'https://whiteestate.org/devotional/ohc/',
            description: 'Sample description',
          }}
          selectedId="ohc"
          isSlate={true}
          subTextStyle="text-slate-400"
          activeParagraphIdx={-1}
          paragraphRefs={mockRefs}
          hasCompletedToday={false}
          streakCount={0}
          isBookReadToday={() => false}
          onRetryFetch={vi.fn()}
          onCompleteReading={onCompleteReading}
          onResetBookStatus={vi.fn()}
        />
      );

      const button = screen.getByText('MARK COMPLETED');
      fireEvent.click(button);

      expect(onCompleteReading).toHaveBeenCalledTimes(1);
    });

    it('should display completion badge if book has been completed today', () => {
      const mockRefs = { current: {} };
      render(
        <ReaderPanel
          content={mockContent}
          isLoadingContent={false}
          contentError={null}
          selectedProfile="clear_modern"
          selectedDevotional={{
            id: 'ohc',
            title: 'Our High Calling',
            cover: 'https://media2.egwwritings.org/covers/81_s.jpg',
            link: 'https://whiteestate.org/devotional/ohc/',
            description: 'Sample description',
          }}
          selectedId="ohc"
          isSlate={true}
          subTextStyle="text-slate-400"
          activeParagraphIdx={-1}
          paragraphRefs={mockRefs}
          hasCompletedToday={true}
          streakCount={1}
          isBookReadToday={() => true}
          onRetryFetch={vi.fn()}
          onCompleteReading={vi.fn()}
          onResetBookStatus={vi.fn()}
        />
      );

      expect(screen.getByText(/COMPLETED \(READ TODAY\)/i)).toBeInTheDocument();
    });
  });

  describe('CacheProgressBanner (FR-7 & Visual Telemetry)', () => {
    it('should render download progress ratio and cancel button when active', () => {
      const onCancel = vi.fn();
      render(
        <CacheProgressBanner
          cacheProgress={{
            active: true,
            title: 'Our High Calling',
            current: 120,
            total: 365,
            isComplete: false,
          }}
          isSlate={true}
          onCancelCache={onCancel}
        />
      );

      expect(screen.getByText(/Our High Calling/i)).toBeInTheDocument();
      expect(screen.getByText(/\(120 \/ 365 days\)/i)).toBeInTheDocument();

      const cancelBtn = screen.getByText('CANCEL');
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalled();
    });

    it('should return null when not active', () => {
      const { container } = render(
        <CacheProgressBanner
          cacheProgress={{
            active: false,
            title: '',
            current: 0,
            total: 0,
            isComplete: false,
          }}
          isSlate={true}
          onCancelCache={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
