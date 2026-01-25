import { test, expect } from '@playwright/test';


test('FitTrack Pro loads correctly', async ({ page }) => {
  // Navigate to your deployed site
  await page.goto('https://dedied.github.io/fittrack-pro/');

  // Basic sanity check: page should contain your app title or a known element
  await expect(page).toHaveTitle(/FitTrack/i);

  // Or check for a visible element you know exists
  await expect(page.locator('text=FitTrack')).toBeVisible();
});

test('Save entry', async ({ page }) => {
  await page.goto('https://dedied.github.io/fittrack-pro/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Log Workout' }).click();
  await page.getByPlaceholder('0').click();
  await page.getByPlaceholder('0').fill('5');
  await page.getByRole('button', { name: 'Finish Entry' }).click();
  await expect(page.getByText('✓ Savexd!')).toBeVisible();
});
