import { syncAlumniData } from '@/lib/alumni-sync-utils'
import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/alumni-sync-utils', () => ({
  syncAlumniData: vi.fn(),
}))

import { OPTIONS, POST } from '@/app/api/alumni/import/route'

const createClientMock = vi.mocked(createClient)
const syncAlumniDataMock = vi.mocked(syncAlumniData)

describe('POST /api/alumni/import', () => {
  beforeEach(() => {
    createClientMock.mockReset()
    syncAlumniDataMock.mockReset()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.local'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  })

  it('returns ok for DEBUG payload without auth check', async () => {
    const request = new Request('http://localhost/api/alumni/import', {
      method: 'POST',
      body: JSON.stringify({ type: 'DEBUG', message: 'hello' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(syncAlumniDataMock).not.toHaveBeenCalled()
  })

  it('returns 401 when api key is invalid', async () => {
    const request = new Request('http://localhost/api/alumni/import', {
      method: 'POST',
      body: JSON.stringify({ data: [] }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'wrong-key',
      },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Non autorisé' })
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('imports alumni and returns summary', async () => {
    const supabaseMock = { id: 'client' } as any
    createClientMock.mockReturnValue(supabaseMock)
    syncAlumniDataMock.mockResolvedValue({
      successCount: 2,
      errorCount: 1,
      logs: [],
    })

    const request = new Request('http://localhost/api/alumni/import', {
      method: 'POST',
      body: JSON.stringify({ data: [{ fullName: 'Alice Doe' }] }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'service-role-test',
      },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(createClientMock).toHaveBeenCalledWith(
      'https://supabase.local',
      'service-role-test'
    )
    expect(syncAlumniDataMock).toHaveBeenCalledWith(supabaseMock, [
      { fullName: 'Alice Doe' },
    ])
    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true, count: 2, errors: 1 })
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('returns 500 when sync throws', async () => {
    createClientMock.mockReturnValue({} as any)
    syncAlumniDataMock.mockRejectedValue(new Error('sync failed'))

    const request = new Request('http://localhost/api/alumni/import', {
      method: 'POST',
      body: JSON.stringify({ data: [{ fullName: 'Alice Doe' }] }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'service-role-test',
      },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'sync failed' })
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})

describe('OPTIONS /api/alumni/import', () => {
  it('returns CORS preflight headers', async () => {
    const response = await OPTIONS()

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'POST, OPTIONS'
    )
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
      'Content-Type, x-api-key'
    )
  })
})
