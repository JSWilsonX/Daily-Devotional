import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareImageCardModal } from '../../components/ShareImageCardModal';

describe('ShareImageCardModal & Graphic Synthesis Engine (FR-8 & Workflow 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with initial text when open', () => {
    render(
      <ShareImageCardModal
        isOpen={true}
        onClose={vi.fn()}
        initialText="Thy word is a lamp unto my feet."
        bookTitle="Our High Calling"
        dateStr="Sep 1"
        isSlateTheme={true}
      />
    );

    expect(screen.getByText(/Share Reflection as Image/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Thy word is a lamp unto my feet.')).toBeInTheDocument();
  });

  it('should allow toggling between Square 1:1 and Story 9:16 aspect ratios', () => {
    render(
      <ShareImageCardModal
        isOpen={true}
        onClose={vi.fn()}
        initialText="Sample scripture text."
        bookTitle="Our High Calling"
        dateStr="Sep 1"
      />
    );

    const squareBtn = screen.getByText(/1:1 Square/i);
    const storyBtn = screen.getByText(/9:16 Story/i);

    expect(squareBtn).toBeInTheDocument();
    expect(storyBtn).toBeInTheDocument();

    fireEvent.click(storyBtn);
  });

  it('should trigger text copy when COPY TEXT ONLY button is clicked', async () => {
    render(
      <ShareImageCardModal
        isOpen={true}
        onClose={vi.fn()}
        initialText="Sample quote text."
        bookTitle="Our High Calling"
        dateStr="Sep 1"
      />
    );

    const copyBtn = screen.getByText(/COPY TEXT ONLY/i);
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('should trigger close callback when clicking CLOSE', () => {
    const onClose = vi.fn();
    render(
      <ShareImageCardModal
        isOpen={true}
        onClose={onClose}
        initialText="Sample quote text."
        bookTitle="Our High Calling"
        dateStr="Sep 1"
      />
    );

    const closeBtn = screen.getByText(/CLOSE/i);
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
