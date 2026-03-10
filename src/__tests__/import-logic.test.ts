import { describe, it, expect } from 'vitest';
import { parseName, parseYear } from '../../scripts/import-alumni';

describe('Import Script Logic', () => {
  describe('parseName', () => {
    it('should correctly split first and last name', () => {
      const result = parseName('Jean Dupont');
      expect(result.firstName).toBe('Jean');
      expect(result.lastName).toBe('Dupont');
    });

    it('should handle complex names', () => {
      const result = parseName('Jean-Baptiste de La Salle');
      expect(result.firstName).toBe('Jean-Baptiste');
      expect(result.lastName).toBe('de La Salle');
    });

    it('should handle single names', () => {
      const result = parseName('Cher');
      expect(result.firstName).toBe('Cher');
      expect(result.lastName).toBe('');
    });

    it('should trim whitespace', () => {
      const result = parseName('  Marie Martin  ');
      expect(result.firstName).toBe('Marie');
      expect(result.lastName).toBe('Martin');
    });
  });

  describe('parseYear', () => {
    it('should convert string year to number', () => {
      expect(parseYear('2023')).toBe(2023);
    });

    it('should return null for invalid years', () => {
      expect(parseYear('abcd')).toBe(null);
      expect(parseYear(null)).toBe(null);
      expect(parseYear(undefined)).toBe(null);
    });

    it('should handle numeric input', () => {
      expect(parseYear(2021)).toBe(2021);
    });
  });
});
