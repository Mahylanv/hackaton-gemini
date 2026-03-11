import { describe, it, expect } from 'vitest';
import { parseName, parseYear, generateLinkedInUrl, deduplicateDegrees } from '../lib/alumni-sync-utils';

describe('Alumni Sync Utilities', () => {
  describe('parseName', () => {
    it('should correctly parse first name and last name', () => {
      const result = parseName('Jean Dupont');
      expect(result.firstName).toBe('Jean');
      expect(result.lastName).toBe('Dupont');
    });

    it('should handle middle names by adding them to the last name', () => {
      const result = parseName('Jean-Baptiste de La Salle');
      expect(result.firstName).toBe('Jean-Baptiste');
      expect(result.lastName).toBe('de La Salle');
    });

    it('should handle single names', () => {
      const result = parseName('Cher');
      expect(result.firstName).toBe('Cher');
      expect(result.lastName).toBe('');
    });
  });

  describe('deduplicateDegrees', () => {
    it('should return "Parcours non trouvé" for empty list', () => {
      expect(deduplicateDegrees([])).toBe('Parcours non trouvé');
    });

    it('should remove exact duplicates', () => {
      const degrees = ['Bachelor Digital', 'Bachelor Digital', 'MBA'];
      const result = deduplicateDegrees(degrees);
      expect(result).toContain('Bachelor Digital');
      expect(result).toContain('MBA');
    });

    it('should remove partial duplicates (keep longest)', () => {
      const degrees = ['Bachelor', 'Bachelor Développeur Web', 'MBA Marketing'];
      const result = deduplicateDegrees(degrees);
      expect(result).toContain('Bachelor Développeur Web');
      expect(result).toContain('MBA Marketing');
      expect(result).not.toBe('Bachelor / Bachelor Développeur Web / MBA Marketing');
    });
  });

  describe('parseYear', () => {
    it('should parse valid year strings', () => {
      expect(parseYear('2024')).toBe(2024);
    });

    it('should return null for empty or undefined input', () => {
      expect(parseYear('')).toBeNull();
      expect(parseYear(null)).toBeNull();
    });
  });

  describe('generateLinkedInUrl', () => {
    it('should generate a valid slugified URL', () => {
      expect(generateLinkedInUrl('Jean', 'Dupont')).toBe('https://www.linkedin.com/in/jean-dupont/');
    });

    it('should handle accents', () => {
      expect(generateLinkedInUrl('Athénaîs', 'Gravil')).toBe('https://www.linkedin.com/in/athenais-gravil/');
    });
  });
});
