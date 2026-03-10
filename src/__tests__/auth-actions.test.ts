import { login, signOut, signup } from '@/app/auth/actions'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const createClientMock = vi.mocked(createClient)
const revalidatePathMock = vi.mocked(revalidatePath)
const redirectMock = vi.mocked(redirect)

function makeFormData(values: Record<string, string>) {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => formData.set(key, value))
  return formData
}

describe('auth actions', () => {
  beforeEach(() => {
    createClientMock.mockReset()
    revalidatePathMock.mockReset()
    redirectMock.mockReset()
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`)
    })
  })

  it('login redirects to home when credentials are valid', async () => {
    const signInWithPasswordMock = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: { signInWithPassword: signInWithPasswordMock },
    } as any)

    await expect(
      login(
        makeFormData({
          email: 'alice@example.com',
          password: 'secret',
        })
      )
    ).rejects.toThrow('REDIRECT:/')

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret',
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
    expect(redirectMock).toHaveBeenCalledWith('/')
  })

  it('login redirects back to login with error message on failure', async () => {
    const signInWithPasswordMock = vi.fn().mockResolvedValue({
      error: { message: 'Invalid credentials' },
    })
    createClientMock.mockResolvedValue({
      auth: { signInWithPassword: signInWithPasswordMock },
    } as any)

    await expect(
      login(
        makeFormData({
          email: 'alice@example.com',
          password: 'wrong-password',
        })
      )
    ).rejects.toThrow('REDIRECT:/login?error=Invalid credentials')

    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('signup redirects to profile when registration succeeds', async () => {
    const signUpMock = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: { signUp: signUpMock },
    } as any)

    await expect(
      signup(
        makeFormData({
          email: 'new@example.com',
          password: 'secret',
        })
      )
    ).rejects.toThrow('REDIRECT:/profile')

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'secret',
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
  })

  it('signOut signs out user and redirects to login', async () => {
    const signOutMock = vi.fn().mockResolvedValue(undefined)
    createClientMock.mockResolvedValue({
      auth: { signOut: signOutMock },
    } as any)

    await expect(signOut()).rejects.toThrow('REDIRECT:/login')

    expect(signOutMock).toHaveBeenCalled()
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })
})
