import { middleware } from '@/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

const createServerClientMock = vi.mocked(createServerClient)

function makeRequest(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`)
}

describe('middleware', () => {
  beforeEach(() => {
    createServerClientMock.mockReset()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.local'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-test'
  })

  it('skips auth for public routes', async () => {
    const response = await middleware(makeRequest('/alumni'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(createServerClientMock).not.toHaveBeenCalled()
  })

  it('redirects to /login when private route has no user', async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as any)

    const response = await middleware(makeRequest('/profile'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toMatch(/\/login$/)
  })

  it('allows private route when user exists', async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
      },
    } as any)

    const response = await middleware(makeRequest('/admin'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })
})
