import { startOfWeek as dfStartOfWeek, endOfWeek as dfEndOfWeek, isSameDay as dfIsSameDay, isWithinInterval, format as dfFormat, parseISO as dfParseISO } from 'date-fns'

// Helper to accept Date or ISO string
function toDate(input) {
  if (typeof input === 'string') return dfParseISO(input)
  return input instanceof Date ? input : new Date(input)
}

function toUTCDateFromLocal(d) {
  // Convert local date to UTC midnight for consistent toISOString date string
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()
  return new Date(Date.UTC(y, m, day))
}

export function startOfWeek(date, weekStart = 1) {
  const d = toDate(date)
  const s = dfStartOfWeek(d, { weekStartsOn: weekStart })
  return toUTCDateFromLocal(s)
}

export function endOfWeek(date, weekStart = 1) {
  const d = toDate(date)
  const e = dfEndOfWeek(d, { weekStartsOn: weekStart })
  return toUTCDateFromLocal(e)
}

export function isSameDay(a, b) {
  const da = toDate(a)
  const db = toDate(b)
  return dfIsSameDay(da, db)
}

export function isInRange(date, start, end) {
  const d = toDate(date)
  const s = toDate(start)
  const e = toDate(end)
  return isWithinInterval(d, { start: s, end: e })
}

export function formatTWDate(date, fmt = 'yyyy-MM-dd') {
  const d = toDate(date)
  return dfFormat(d, fmt)
}
