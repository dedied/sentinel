// @checklyId 37430bc6-e8c7-420b-a71a-8b2aff8cb901

import { test, expect } from '@playwright/test';

test('The "Save Entry" button should display a "✓ Saved!" toast message on a successful save', async ({ page }) => {
  await page.goto('https://dedied.github.io/fittrack-pro/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Log Workout' }).click();
  await page.getByPlaceholder('0').click();
  await page.getByPlaceholder('0').fill('5');
  await page.getByRole('button', { name: 'Finish Entry' }).click();
  await expect(page.getByText('✓ Saved!')).toBeVisible();
});
