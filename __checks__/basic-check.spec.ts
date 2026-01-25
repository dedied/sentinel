import { test, expect } from '@playwright/test';

test('FitTrack Pro loads correctly', async ({ page }) => {
  // Navigate to your deployed site
  await page.goto('https://dedied.github.io/fittrack-pro/');

  // Basic sanity check: page should contain your app title or a known element
  await expect(page).toHaveTitle(/FitTrack/i);

  // Or check for a visible element you know exists
  await expect(page.locator('text=FitTrack')).toBeVisible();
});
