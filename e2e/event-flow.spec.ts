import { test, expect } from '@playwright/test'

test('create event via modal and see it in month and week views', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-month')
  // click a known date cell, 2026-01-10
  await page.waitForSelector('[data-date="2026-01-10"]')
  await page.click('[data-date="2026-01-10"]')
  // fill title and date
  await page.fill('#event-title', 'E2E Meeting')
  // use selects to set start/end (AM/PM in our UI)
  await page.selectOption('#event-start-ampm', 'AM')
  await page.selectOption('#event-start-hour', '09')
  await page.selectOption('#event-start-minute', '00')
  await page.selectOption('#event-end-ampm', 'AM')
  await page.selectOption('#event-end-hour', '10')
  await page.selectOption('#event-end-minute', '00')
  await page.click('#event-form .primary')
  // assert month cell contains the event by accessible name
  await expect(page.getByRole('button', { name: 'E2E Meeting' })).toBeVisible()
  // switch to week view and assert event block exists
  await page.click('#btn-week')
  await page.waitForSelector('.event[data-id]')
  await expect(page.getByRole('button', { name: 'E2E Meeting' })).toBeVisible()
})