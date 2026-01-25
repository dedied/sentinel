// @checklyId c7a3e4a9-56ed-492e-8eab-049fb0d478e3

import { test, expect } from '@playwright/test';

test('The Cloud Sync status label on the left-hand menu should say "Not signed in" when disconnected', async ({ page }) => {
  await page.goto('https://dedied.github.io/fittrack-pro/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await expect(page.getByText('Not signed in')).toBeVisible();
});
