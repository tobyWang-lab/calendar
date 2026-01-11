import { describe, it, expect } from 'vitest'
// TDD: tests reference the module to be implemented in T7
import { startOfWeek, endOfWeek, isSameDay, isInRange, formatTWDate } from '../src/utils/date-utils.js'

describe('date-utils', () => {
  it('startOfWeek returns Monday for 2026-01-10 when weekStart=1 (Monday)', () => {
    const d = new Date('2026-01-10') // Saturday
    expect(startOfWeek(d, 1).toISOString().slice(0,10)).toBe('2026-01-05')
  })

  it('endOfWeek returns Sunday for 2026-01-10 when weekStart=1 (Monday)', () => {
    const d = new Date('2026-01-10')
    expect(endOfWeek(d, 1).toISOString().slice(0,10)).toBe('2026-01-11')
  })

  it('isSameDay works with strings and dates', () => {
    expect(isSameDay('2026-01-10', '2026-01-10')).toBe(true)
    expect(isSameDay(new Date('2026-01-10'), '2026-01-11')).toBe(false)
  })

  it('isInRange detects inclusive ranges', () => {
    expect(isInRange('2026-01-10', '2026-01-01', '2026-01-31')).toBe(true)
    expect(isInRange('2026-02-01', '2026-01-01', '2026-01-31')).toBe(false)
  })

  it('formatTWDate formats to yyyy-MM-dd', () => {
    expect(formatTWDate(new Date('2026-01-10'))).toBe('2026-01-10')
  })
})