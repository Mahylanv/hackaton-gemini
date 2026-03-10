import { cn } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold')
  })

  it('resolves tailwind conflicts with last class wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('filters falsy values and supports objects', () => {
    expect(cn('base', false && 'hidden', { active: true, disabled: false })).toBe(
      'base active'
    )
  })
})
