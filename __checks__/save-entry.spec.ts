// @checklyId 37430bc6-e8c7-420b-a71a-8b2aff8cb901

import { test, expect } from '@playwright/test';

test('Attempt to use the save entry button', async ({ page }) => {
  await page.goto('https://dedied.github.io/fittrack-pro/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Log Workout' }).click();
  await page.getByPlaceholder('0').click();
  await page.getByPlaceholder('0').fill('5');
  await page.getByRole('button', { name: 'Finish Entry' }).click();
  await expect(page.getByText('✓ Saved!')).toBeVisible();
});
