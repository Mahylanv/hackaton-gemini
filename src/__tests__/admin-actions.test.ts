import { describe, it, expect, vi } from 'vitest';
import { generateLinkedInUrl } from '../lib/alumni-sync-utils';

// We test the logic used by the admin actions
describe('Admin Action Logic', () => {
  it('should generate predictable linkedin URLs for import', () => {
    const firstName = "Mahylan";
    const lastName = "Veclin";
    const expected = "https://www.linkedin.com/in/mahylan-veclin/";
    
    expect(generateLinkedInUrl(firstName, lastName)).toBe(expected);
  });

  it('should handle uppercase names in URL generation', () => {
    const firstName = "Romain";
    const lastName = "MARCELLI";
    const expected = "https://www.linkedin.com/in/romain-marcelli/";
    
    expect(generateLinkedInUrl(firstName, lastName)).toBe(expected);
  });
});
