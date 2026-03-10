import { updateProfile } from '@/app/profile/actions'
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

describe('updateProfile', () => {
  beforeEach(() => {
    createClientMock.mockReset()
    revalidatePathMock.mockReset()
    redirectMock.mockReset()
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`)
    })
  })

  it('redirects to login when no authenticated user exists', async () => {
    const fromMock = vi.fn()
    createClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: fromMock,
    } as any)

    await expect(
      updateProfile(
        makeFormData({
          firstName: 'Alice',
          lastName: 'Doe',
          linkedinUrl: 'https://linkedin.com/in/alice-doe',
          gradYear: '2025',
          degree: 'Mastère Product',
        })
      )
    ).rejects.toThrow('REDIRECT:/login')

    expect(fromMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('updates profile and redirects home on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn(() => ({ eq: eqMock }))
    const fromMock = vi.fn(() => ({ update: updateMock }))

    createClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: fromMock,
    } as any)

    await expect(
      updateProfile(
        makeFormData({
          firstName: 'Alice',
          lastName: 'Doe',
          linkedinUrl: 'https://linkedin.com/in/alice-doe',
          gradYear: '2025',
          degree: 'Mastère Product',
        })
      )
    ).rejects.toThrow('REDIRECT:/')

    expect(fromMock).toHaveBeenCalledWith('profiles')
    expect(updateMock).toHaveBeenCalledWith({
      first_name: 'Alice',
      last_name: 'Doe',
      linkedin_url: 'https://linkedin.com/in/alice-doe',
      grad_year: 2025,
      degree: 'Mastère Product',
      updated_at: expect.any(String),
    })
    expect(eqMock).toHaveBeenCalledWith('id', 'u1')
    expect(revalidatePathMock).toHaveBeenCalledWith('/profile')
    expect(revalidatePathMock).toHaveBeenCalledWith('/')
  })

  it('redirects back to profile with error when update fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'db error' } })
    const updateMock = vi.fn(() => ({ eq: eqMock }))
    const fromMock = vi.fn(() => ({ update: updateMock }))

    createClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: fromMock,
    } as any)

    await expect(
      updateProfile(
        makeFormData({
          firstName: 'Alice',
          lastName: 'Doe',
          linkedinUrl: 'https://linkedin.com/in/alice-doe',
          gradYear: '2025',
          degree: 'Mastère Product',
        })
      )
    ).rejects.toThrow('REDIRECT:/profile?error=db error')

    expect(revalidatePathMock).not.toHaveBeenCalled()
  })
})
