import { describe, it, expect } from 'vitest';
import {
  numberToWords,
  replaceNthWord,
  isSingleChapterBook,
  verbalizeBook,
  formatVerseList,
  verbalizeScripture,
} from '../../utils/text';

describe('Text Utilities & Verbalization Engine', () => {
  describe('numberToWords', () => {
    it('should convert single digit numbers correctly', () => {
      expect(numberToWords(0)).toBe('zero');
      expect(numberToWords(1)).toBe('one');
      expect(numberToWords(7)).toBe('seven');
      expect(numberToWords(9)).toBe('nine');
    });

    it('should convert teen numbers correctly', () => {
      expect(numberToWords(10)).toBe('ten');
      expect(numberToWords(13)).toBe('thirteen');
      expect(numberToWords(18)).toBe('eighteen');
      expect(numberToWords(19)).toBe('nineteen');
    });

    it('should convert tens and compound numbers up to 99', () => {
      expect(numberToWords(20)).toBe('twenty');
      expect(numberToWords(35)).toBe('thirty-five');
      expect(numberToWords(99)).toBe('ninety-nine');
    });

    it('should convert hundreds and compound hundreds up to 999', () => {
      expect(numberToWords(100)).toBe('one hundred');
      expect(numberToWords(119)).toBe('one hundred nineteen');
      expect(numberToWords(365)).toBe('three hundred sixty-five');
      expect(numberToWords(999)).toBe('nine hundred ninety-nine');
    });

    it('should fallback to string for numbers >= 1000', () => {
      expect(numberToWords(1000)).toBe('1000');
    });
  });

  describe('replaceNthWord', () => {
    it('should replace the exact Nth occurrence of a word preserving boundaries', () => {
      const input = 'We live our lives and we live in peace.';
      // 1st occurrence of "live"
      const res1 = replaceNthWord(input, 'live', 1, 'liv');
      expect(res1).toBe('We liv our lives and we live in peace.');

      // 2nd occurrence of "live"
      const res2 = replaceNthWord(input, 'live', 2, 'liv');
      expect(res2).toBe('We live our lives and we liv in peace.');
    });

    it('should preserve capitalization when replacing capitalized words', () => {
      const input = 'Live each day well as you live.';
      const res = replaceNthWord(input, 'live', 1, 'liv');
      expect(res).toBe('Liv each day well as you live.');
    });

    it('should return original text if target word is not found or occurrence exceeds count', () => {
      const input = 'The Lord is my shepherd.';
      expect(replaceNthWord(input, 'nonexistent', 1, 'sub')).toBe(input);
      expect(replaceNthWord(input, 'Lord', 2, 'sub')).toBe(input);
    });

    it('should handle empty or null inputs safely', () => {
      expect(replaceNthWord('', 'test', 1, 'sub')).toBe('');
      expect(replaceNthWord('sample', '', 1, 'sub')).toBe('sample');
    });
  });

  describe('isSingleChapterBook', () => {
    it('should identify single chapter books correctly', () => {
      expect(isSingleChapterBook('Jude')).toBe(true);
      expect(isSingleChapterBook('Obadiah')).toBe(true);
      expect(isSingleChapterBook('Philemon')).toBe(true);
      expect(isSingleChapterBook('2 John')).toBe(true);
      expect(isSingleChapterBook('Second John')).toBe(true);
      expect(isSingleChapterBook('3 John')).toBe(true);
      expect(isSingleChapterBook('Third John')).toBe(true);
    });

    it('should return false for multi-chapter books', () => {
      expect(isSingleChapterBook('Genesis')).toBe(false);
      expect(isSingleChapterBook('Romans')).toBe(false);
      expect(isSingleChapterBook('John')).toBe(false);
      expect(isSingleChapterBook('1 Corinthians')).toBe(false);
    });
  });

  describe('verbalizeBook', () => {
    it('should expand numerical and roman numeral prefixes to spoken ordinals', () => {
      expect(verbalizeBook('1 Cor')).toBe('First Corinthians');
      expect(verbalizeBook('2 Cor')).toBe('Second Corinthians');
      expect(verbalizeBook('3 John')).toBe('Third John');
      expect(verbalizeBook('I Tim')).toBe('First Timothy');
      expect(verbalizeBook('II Tim')).toBe('Second Timothy');
      expect(verbalizeBook('1st Pet')).toBe('First Peter');
      expect(verbalizeBook('2nd Pet')).toBe('Second Peter');
    });

    it('should expand common biblical abbreviations to full names', () => {
      expect(verbalizeBook('Gen')).toBe('Genesis');
      expect(verbalizeBook('Exod')).toBe('Exodus');
      expect(verbalizeBook('Lev')).toBe('Leviticus');
      expect(verbalizeBook('Num')).toBe('Numbers');
      expect(verbalizeBook('Deut')).toBe('Deuteronomy');
      expect(verbalizeBook('Psa')).toBe('Psalm');
      expect(verbalizeBook('Psalms')).toBe('Psalm');
      expect(verbalizeBook('Prov')).toBe('Proverbs');
      expect(verbalizeBook('Isa')).toBe('Isaiah');
      expect(verbalizeBook('Jer')).toBe('Jeremiah');
      expect(verbalizeBook('Ezek')).toBe('Ezekiel');
      expect(verbalizeBook('Matt')).toBe('Matthew');
      expect(verbalizeBook('Rom')).toBe('Romans');
      expect(verbalizeBook('Rev')).toBe('Revelation');
    });
  });

  describe('formatVerseList', () => {
    it('should format single verses', () => {
      expect(formatVerseList('16')).toBe('verse sixteen');
    });

    it('should format verse ranges', () => {
      expect(formatVerseList('1-3')).toBe('verses one through three');
      expect(formatVerseList('10–12')).toBe('verses ten through twelve');
    });

    it('should format two verses with "and"', () => {
      expect(formatVerseList('18, 19')).toBe('verse eighteen and nineteen');
      expect(formatVerseList('18 and 19')).toBe('verse eighteen and nineteen');
    });

    it('should format multiple verses with comma series and oxford and', () => {
      expect(formatVerseList('28, 31, 38')).toBe('verse twenty-eight, thirty-one, and thirty-eight');
    });
  });

  describe('verbalizeScripture (End-to-End Regex Verbalizer)', () => {
    it('should verbalize standard book, chapter and verse citations', () => {
      const input = 'For God so loved the world. (John 3:16)';
      const output = verbalizeScripture(input);
      expect(output).toBe('For God so loved the world. (John chapter three, verse sixteen)');
    });

    it('should verbalize complex chapter and multiple verses', () => {
      const input = 'Hear the word of the Lord (Jeremiah 35:18, 19)';
      const output = verbalizeScripture(input);
      expect(output).toBe('Hear the word of the Lord (Jeremiah chapter thirty-five, verse eighteen and nineteen)');
    });

    it('should handle Psalm references specifically (Psalm 51:10 without "chapter")', () => {
      const input = 'Create in me a clean heart (Psalm 51:10)';
      const output = verbalizeScripture(input);
      expect(output).toBe('Create in me a clean heart (Psalm fifty-one, verse ten)');
    });

    it('should handle chapter ranges (Genesis 1-3)', () => {
      const input = 'In the beginning (Genesis 1-3)';
      const output = verbalizeScripture(input);
      expect(output).toBe('In the beginning (Genesis chapters one through three)');
    });

    it('should handle single chapter books (Jude 18, 19)', () => {
      const input = 'Remember the apostles words (Jude 18, 19)';
      const output = verbalizeScripture(input);
      expect(output).toBe('Remember the apostles words (Jude verse eighteen and nineteen)');
    });

    it('should handle cross-chapter ranges (John 1:1-2:3)', () => {
      const input = 'Read the story in John 1:1-2:3.';
      const output = verbalizeScripture(input);
      expect(output).toBe('Read the story in John chapter one, verse one through chapter two, verse three.');
    });

    it('should handle ordinal book numbers with comma spacing', () => {
      const input = 'Fight the good fight (1 Tim 6:12)';
      const output = verbalizeScripture(input);
      expect(output).toBe('Fight the good fight (First Timothy, chapter six, verse twelve)');
    });
  });
});
