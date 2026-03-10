import manifest from '@/app/manifest'
import { describe, expect, it } from 'vitest'

describe('app manifest', () => {
  it('returns expected metadata values', () => {
    const data = manifest()

    expect(data.name).toBe('MYDIGITALUMNI')
    expect(data.short_name).toBe('MYDIGITALUMNI')
    expect(data.start_url).toBe('/')
    expect(data.display).toBe('standalone')
    expect(data.theme_color).toBe('#0f172a')
    expect(data.background_color).toBe('#ffffff')
    expect(data.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/icon-192.png', sizes: '192x192' }),
        expect.objectContaining({ src: '/icon-512.png', sizes: '512x512' }),
      ])
    )
  })
})
