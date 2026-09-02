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

describe('Additional E2E User Workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Mock fetch for catalogue list and content fetches
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/scrape-devotionals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            source: 'static',
            data: [{ id: 'ohc', title: 'Our High Calling', cover: 'https://cover.jpg', link: 'https://whiteestate.org/devotional/ohc/', description: 'desc' }],
          }),
        });
      }

      if (url.includes('/api/fetch-devotional')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            title: 'Sample Content Title',
            paragraphs: [
              { id: 'p_1', type: 'scripture', text: 'Creation (Genesis 1:1)', pronunciationOverrides: [] },
              { id: 'p_2', type: 'body', text: 'Detailed study context', pronunciationOverrides: [] }
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

  it('should switch reading styles and refetch content (Workflow 2)', async () => {
    const { container } = renderAppWithProviders();

    // Wait for initial mount and effects to settle
    await new Promise((r) => setTimeout(r, 100));

    // Select book via explicit item ID
    await waitFor(() => {
      expect(container.querySelector('#carousel-item-ohc')).toBeInTheDocument();
    });
    fireEvent.click(container.querySelector('#carousel-item-ohc')!);

    await waitFor(() => {
      expect(screen.getByText('Sample Content Title')).toBeInTheDocument();
    });

    // Change style dropdown selection specifically by ID to avoid combobox role duplicates
    const select = container.querySelector('#header-profile-switcher') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'easy_reading' } });

    expect(localStorage.getItem('egw_selected_profile')).toBe('easy_reading');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('profile=easy_reading'));
    });
  });

  it('should traverse date coordinates via prev/next buttons (Workflow 3)', async () => {
    const { container } = renderAppWithProviders();

    // Wait for initial mount and effects to settle
    await new Promise((r) => setTimeout(r, 100));

    await waitFor(() => {
      expect(container.querySelector('#carousel-item-ohc')).toBeInTheDocument();
    });
    fireEvent.click(container.querySelector('#carousel-item-ohc')!);

    await waitFor(() => {
      expect(screen.getByText('Sample Content Title')).toBeInTheDocument();
    });

    // Find and click the previous day button
    const prevBtn = screen.getByTitle('Previous Day');
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should support toggle theme aesthetic environments (Workflow 5)', async () => {
    renderAppWithProviders();

    // Wait for initial mount and effects to settle
    await new Promise((r) => setTimeout(r, 100));

    await waitFor(() => {
      expect(screen.getByTitle('Change preset theme')).toBeInTheDocument();
    });

    const themeToggleBtn = screen.getByTitle('Change preset theme');
    fireEvent.click(themeToggleBtn);

    expect(localStorage.getItem('egw_theme')).toBe('cream');
  });

  it('should trigger offline book pre-cache batch operations (Workflow 6)', async () => {
    const { container } = renderAppWithProviders();

    // Wait for initial mount and effects to settle
    await new Promise((r) => setTimeout(r, 100));

    await waitFor(() => {
      expect(container.querySelector('#book-cover-ohc')).toBeInTheDocument();
    });

    const cacheBtns = screen.getAllByText('CACHE');
    fireEvent.click(cacheBtns[0]);

    // Click cancel button on progress banner immediately to stop the loop
    const cancelBtn = screen.getByText('CANCEL');
    fireEvent.click(cancelBtn);

    // Verify localStorage list includes cached ID (first book in carousel is blj)
    expect(localStorage.getItem('egw_cached_books')).toContain('blj');
  });

  it('should display error panel and recover successfully on Retry (Workflow 8)', async () => {
    // Mock temporary fetch error
    let failFetch = true;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/scrape-devotionals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            source: 'static',
            data: [{ id: 'ohc', title: 'Our High Calling', cover: 'https://cover.jpg', link: 'https://whiteestate.org/devotional/ohc/', description: 'desc' }],
          }),
        });
      }
      if (url.includes('/api/fetch-devotional')) {
        if (failFetch) {
          return Promise.reject(new Error('Server offline'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            title: 'Recovered Content Title',
            paragraphs: [{ id: 'p_1', type: 'body', text: 'Text', pronunciationOverrides: [] }],
            source: 'database',
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    }) as any;

    const { container } = renderAppWithProviders();

    // Wait for initial mount and effects to settle
    await new Promise((r) => setTimeout(r, 100));

    await waitFor(() => {
      expect(container.querySelector('#carousel-item-ohc')).toBeInTheDocument();
    });
    fireEvent.click(container.querySelector('#carousel-item-ohc')!);

    // Error view should render with standard offline/server error notice
    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    // Recover fetch and click retry
    failFetch = false;
    const retryBtn = screen.getByText('RE-INITIALIZE FEED');
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Recovered Content Title')).toBeInTheDocument();
    });
  });
});

