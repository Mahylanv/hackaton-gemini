import {
  fetchAlumniFromLinkedIn,
  generateLinkedInUrl,
  parseName,
  parseYear,
  syncAlumniData,
  type AlumniData,
} from '@/lib/alumni-sync-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('alumni-sync-utils', () => {
  const originalApiKey = process.env.APOLLO_API_KEY
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.APOLLO_API_KEY
  })

  afterEach(() => {
    process.env.APOLLO_API_KEY = originalApiKey
    global.fetch = originalFetch
  })

  describe('parseName', () => {
    it('splits first and last name', () => {
      expect(parseName('Jean Dupont')).toEqual({
        firstName: 'Jean',
        lastName: 'Dupont',
      })
    })

    it('handles single name', () => {
      expect(parseName('Madonna')).toEqual({
        firstName: 'Madonna',
        lastName: '',
      })
    })
  })

  describe('parseYear', () => {
    it('returns null for empty or invalid values', () => {
      expect(parseYear(undefined)).toBeNull()
      expect(parseYear(null)).toBeNull()
      expect(parseYear('')).toBeNull()
      expect(parseYear('abc')).toBeNull()
    })

    it('returns integer when year is valid', () => {
      expect(parseYear('2024')).toBe(2024)
      expect(parseYear(2023)).toBe(2023)
    })
  })

  describe('generateLinkedInUrl', () => {
    it('slugifies names and removes accents', () => {
      expect(generateLinkedInUrl('Élodie', 'De La Cruz')).toBe(
        'https://www.linkedin.com/in/elodie-de-la-cruz/'
      )
    })
  })

  describe('fetchAlumniFromLinkedIn', () => {
    it('returns mock data when APOLLO_API_KEY is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const data = await fetchAlumniFromLinkedIn()

      expect(warnSpy).toHaveBeenCalled()
      expect(data).toHaveLength(1)
      expect(data[0]).toMatchObject({
        degree: 'MBA Management',
        gradYear: 2025,
      })
      expect(data[0].fullName).toContain('Alumni de Test')
      expect(data[0].linkedinUrl).toContain('https://linkedin.com/in/alumni-')
    })

    it('maps Apollo response when API call succeeds', async () => {
      process.env.APOLLO_API_KEY = 'apollo-test-key'

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          people: [
            {
              first_name: 'Marie',
              last_name: 'Martin',
              linkedin_url: 'https://linkedin.com/in/marie-martin',
              photo_url: 'https://images.test/marie.png',
              title: 'Product Designer',
              education: [{ end_year: 2022 }],
            },
          ],
        }),
      }) as unknown as typeof fetch

      const data = await fetchAlumniFromLinkedIn()

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.apollo.io/v1/people/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Api-Key': 'apollo-test-key',
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(data).toEqual([
        {
          fullName: 'Marie Martin',
          linkedinUrl: 'https://linkedin.com/in/marie-martin',
          profileImageUrl: 'https://images.test/marie.png',
          degree: 'Product Designer',
          gradYear: 2022,
        },
      ])
    })

    it('throws when Apollo returns a non-ok response', async () => {
      process.env.APOLLO_API_KEY = 'apollo-test-key'
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'rate limit reached',
      }) as unknown as typeof fetch

      await expect(fetchAlumniFromLinkedIn()).rejects.toThrow(
        'Échec du scraping via Apollo API (Status: 429)'
      )
    })
  })

  describe('syncAlumniData', () => {
    it('syncs alumni and reports success/error counts', async () => {
      const upsertMock = vi
        .fn()
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: { message: 'duplicate key' } })
      const fromMock = vi.fn(() => ({ upsert: upsertMock }))
      const supabase = { from: fromMock } as any

      const payload: AlumniData[] = [
        {
          fullName: 'Alice Doe',
          linkedinUrl: 'https://linkedin.com/in/alice-doe',
          profileImageUrl: 'https://images.test/alice.png',
          degree: 'Mastère Product',
          entryYear: '2020',
          gradYear: '2025',
          email: 'alice@example.com',
        },
        {
          fullName: 'Bob',
          linkedinUrl: 'https://linkedin.com/in/bob',
          entryYear: 'invalid',
          gradYear: 2024,
        },
      ]

      const result = await syncAlumniData(supabase, payload)

      expect(fromMock).toHaveBeenCalledTimes(2)
      expect(fromMock).toHaveBeenCalledWith('alumni')

      const [firstRow, firstOptions] = upsertMock.mock.calls[0]
      expect(firstRow).toMatchObject({
        first_name: 'Alice',
        last_name: 'Doe',
        linkedin_url: 'https://linkedin.com/in/alice-doe',
        avatar_url: 'https://images.test/alice.png',
        degree: 'Mastère Product',
        entry_year: 2020,
        grad_year: 2025,
        email: 'alice@example.com',
      })
      expect(firstRow.updated_at).toEqual(expect.any(String))
      expect(firstOptions).toEqual({ onConflict: 'linkedin_url' })

      const [secondRow] = upsertMock.mock.calls[1]
      expect(secondRow).toMatchObject({
        first_name: 'Bob',
        last_name: '',
        degree: 'Non spécifié',
        entry_year: null,
        grad_year: 2024,
        email: null,
      })

      expect(result.successCount).toBe(1)
      expect(result.errorCount).toBe(1)
      expect(result.logs).toEqual([
        '[SUCCESS] Alice Doe synchronisé.',
        '[ERROR] Bob: duplicate key',
      ])
    })
  })
})
