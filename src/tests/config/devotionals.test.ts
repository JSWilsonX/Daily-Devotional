import { describe, it, expect } from 'vitest';
import {
  dailyDevotionals,
  UNREAD_BOOKS_ORDER,
  DEVOTIONAL_PROFILES,
  PROFILE_VOICE_CONFIGS,
  PRONUNCIATION_REPLACEMENTS,
} from '../../config/devotionals';

describe('Devotionals Catalog, Profiles, & Configuration Matrix (FR-1, FR-2, FR-4)', () => {
  it('should include exactly 22 curated Ellen G. White devotional books in the catalog', () => {
    expect(dailyDevotionals).toHaveLength(22);
  });

  it('should verify all 22 book IDs match the documented 3-letter specifications', () => {
    const expectedIds = [
      'ohc', 'fh', 'ul', 'tmk', 'rc', 'ctr', 'cc', 'ag', 'hp', 'lhu',
      'mar', 'mlt', 'ofc', 'blj', 'flb', 'hb', 'rre', 'sd', 'tdg', 'wgd',
      'yrp', 'jnn'
    ];

    const catalogIds = dailyDevotionals.map(d => d.id);
    expect(catalogIds.sort()).toEqual(expectedIds.sort());

    // Verify all unread order IDs also match the 22 IDs
    expect(UNREAD_BOOKS_ORDER).toHaveLength(22);
    expect([...UNREAD_BOOKS_ORDER].sort()).toEqual(expectedIds.sort());
  });

  it('should ensure each catalog entry has required metadata fields', () => {
    dailyDevotionals.forEach(book => {
      expect(book.id).toBeTruthy();
      expect(book.title).toBeTruthy();
      expect(book.cover).toMatch(/^https:\/\//);
      expect(book.link).toMatch(/^https:\/\/whiteestate\.org\/devotional\//);
      expect(book.description.length).toBeGreaterThan(10);
    });
  });

  it('should define all 6 documented reading profile styles', () => {
    const profileIds = DEVOTIONAL_PROFILES.map(p => p.id);
    expect(profileIds).toEqual([
      'classic',
      'clear_modern',
      'easy_reading',
      'young_adult',
      'teens_youth',
      'kids_primary'
    ]);
  });

  it('should map each profile to specific voice parameters', () => {
    DEVOTIONAL_PROFILES.forEach(profile => {
      const voiceConfig = PROFILE_VOICE_CONFIGS[profile.id];
      expect(voiceConfig).toBeDefined();
      expect(voiceConfig.rate).toBeGreaterThan(0.5);
      expect(voiceConfig.pitch).toBeGreaterThan(0.5);
      expect(['male', 'female', 'any']).toContain(voiceConfig.genderPref);
    });

    // Verify specific profile voice archetypes
    expect(PROFILE_VOICE_CONFIGS.classic.genderPref).toBe('male');
    expect(PROFILE_VOICE_CONFIGS.kids_primary.genderPref).toBe('female');
    expect(PROFILE_VOICE_CONFIGS.kids_primary.pitch).toBeGreaterThan(1.0);
  });

  it('should contain all required phonetic homograph replacement tokens (Rule 3)', () => {
    const requiredTokens = [
      'LIVE_VERB',
      'LIVE_ADJECTIVE',
      'READ_PRESENT',
      'READ_PAST',
      'LEAD_VERB',
      'LEAD_METAL',
      'WIND_AIR',
      'WIND_TURN',
      'TEAR_RIP',
      'TEAR_CRY',
      'BASS_MUSIC',
      'BASS_FISH',
      'CLOSE_NEAR',
      'CLOSE_SHUT',
      'MINUTE_TIME',
      'MINUTE_TINY',
      'OBJECT_NOUN',
      'OBJECT_VERB',
      'RECORD_NOUN',
      'RECORD_VERB',
      'PRESENT_NOUN',
      'PRESENT_VERB'
    ];

    requiredTokens.forEach(token => {
      expect(PRONUNCIATION_REPLACEMENTS[token]).toBeDefined();
      expect(typeof PRONUNCIATION_REPLACEMENTS[token]).toBe('string');
    });

    expect(PRONUNCIATION_REPLACEMENTS.LIVE_VERB).toBe('liv');
    expect(PRONUNCIATION_REPLACEMENTS.READ_PAST).toBe('red');
    expect(PRONUNCIATION_REPLACEMENTS.RECORD_NOUN).toBe('rekurd');
  });
});
