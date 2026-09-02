import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { TourProvider } from '../../components/Tour';

function renderAppWithProviders() {
  return render(
    <TourProvider>
      <App />
    </TourProvider>
  );
}

describe('App Level Workflow & State Integration Tests (Workflows 1, 2, 5, 6, 9, 10)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Mock window.fetch for /api/scrape-devotionals and /api/fetch-devotional
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/scrape-devotionals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            source: 'static',
            data: [
              {
                id: 'ohc',
                title: 'Our High Calling',
                cover: 'https://media2.egwwritings.org/covers/81_s.jpg',
                link: 'https://whiteestate.org/devotional/ohc/',
                description: 'A classic devotional call to holiness...',
              },
            ],
          }),
        });
      }

      if (url.includes('/api/fetch-devotional')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            title: 'A Clean Heart',
            paragraphs: [
              {
                id: 'p_1',
                type: 'scripture',
                text: 'Create in me a clean heart, O God. (Psalm 51:10)',
                pronunciationOverrides: [],
              },
              {
                id: 'p_2',
                type: 'body',
                text: 'Living in continuous alignment with truth.',
                pronunciationOverrides: [],
              },
            ],
            source: 'database',
          }),
        });
      }

      return Promise.reject(new Error('Unknown URL: ' + url));
    }) as any;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render library catalog carousel on startup when no book is saved', async () => {
    renderAppWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Our High Calling').length).toBeGreaterThan(0);
    });
  });

  it('should select a book, fetch content, and display in ReaderPanel (Workflow 1)', async () => {
    renderAppWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Our High Calling').length).toBeGreaterThan(0);
    });

    const bookTitle = screen.getAllByText('Our High Calling')[0];
    fireEvent.click(bookTitle);

    await waitFor(() => {
      expect(screen.getByText('A Clean Heart')).toBeInTheDocument();
      expect(screen.getByText('MARK COMPLETED')).toBeInTheDocument();
    });

    expect(localStorage.getItem('egw_selected_devotional_id')).toBe('ohc');
  });

  it('should increment streak when clicking MARK COMPLETED (FR-5 & Rule 1)', async () => {
    renderAppWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Our High Calling').length).toBeGreaterThan(0);
    });

    const bookTitle = screen.getAllByText('Our High Calling')[0];
    fireEvent.click(bookTitle);

    await waitFor(() => {
      expect(screen.getByText('MARK COMPLETED')).toBeInTheDocument();
    });

    const markBtn = screen.getByText('MARK COMPLETED');
    fireEvent.click(markBtn);

    await waitFor(() => {
      expect(screen.getByText(/COMPLETED/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('egw_streak_count')).toBe('1');
  });
});
