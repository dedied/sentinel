import { test, expect } from '@playwright/test';

test('The "Save Entry" button should trigger a "✓ Saved!" toast message on a successful save', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Log Workout' }).click();
  await page.getByPlaceholder('0').click();
  await page.getByPlaceholder('0').fill('5');
  await page.getByRole('button', { name: 'Finish Entry' }).click();
  await expect(page.getByText('✓ Saved!')).toBeVisible();
});
