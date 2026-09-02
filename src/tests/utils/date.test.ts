import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getLocalDateString, formatDateForInput, formatDateDisplay, calculateInitialStreak } from '../../utils/date';

describe('Date & Streak Business Logic Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('getLocalDateString & formatDateForInput', () => {
    it('should format dates deterministically to YYYY-MM-DD', () => {
      const d = new Date(2026, 8, 1); // Sept 1, 2026
      expect(getLocalDateString(d)).toBe('2026-09-01');
      expect(formatDateForInput(d)).toBe('2026-09-01');
    });

    it('should pad single-digit months and days with leading zeros', () => {
      const d = new Date(2026, 0, 5); // Jan 5, 2026
      expect(getLocalDateString(d)).toBe('2026-01-05');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format dates as Month abbreviation and day (e.g. Sep 1)', () => {
      const d = new Date(2026, 8, 1);
      expect(formatDateDisplay(d)).toBe('Sep 1');
    });
  });

  describe('calculateInitialStreak (Habit Mathematics Business Rule FR-5 & Rule 1)', () => {
    it('should return 0 when no stored streak or last read date exists', () => {
      expect(calculateInitialStreak()).toBe(0);
    });

    it('should preserve active streak if the last read date was today', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 1, 12, 0, 0)); // Sept 1, 2026

      localStorage.setItem('egw_streak_count', '5');
      localStorage.setItem('egw_last_read_date', '2026-09-01');

      expect(calculateInitialStreak()).toBe(5);
    });

    it('should preserve active streak if the last read date was yesterday (diffDays === 1)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 2, 10, 0, 0)); // Sept 2, 2026

      localStorage.setItem('egw_streak_count', '7');
      localStorage.setItem('egw_last_read_date', '2026-09-01');

      expect(calculateInitialStreak()).toBe(7);
    });

    it('should reset streak to 0 if more than 1 day has elapsed since last read date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 5, 10, 0, 0)); // Sept 5, 2026 (4 days later)

      localStorage.setItem('egw_streak_count', '14');
      localStorage.setItem('egw_last_read_date', '2026-09-01');

      expect(calculateInitialStreak()).toBe(0);
    });

    it('should handle corrupted or invalid streak storage gracefully', () => {
      localStorage.setItem('egw_streak_count', 'invalid');
      localStorage.setItem('egw_last_read_date', '2026-09-01');

      expect(calculateInitialStreak()).toBe(0);
    });
  });
});
