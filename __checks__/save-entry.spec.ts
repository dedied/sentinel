import { test, expect } from '@playwright/test';

test('The "Save Entry" button should trigger a "✓ Saved!" toast message on a successful save', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Log Activity' }).click();
  await page.getByRole('button', { name: 'Select Exercises' }).click();
  await page.getByRole('button', { name: 'bench press Bench Press Chest' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByPlaceholder('0').first().click();
  await page.getByPlaceholder('0').first().fill('55');
  await page.getByPlaceholder('0').nth(1).click();
  await page.getByPlaceholder('0').nth(1).fill('10');
  await page.getByRole('button', { name: 'Finish Entry' }).click();
  await expect(page.getByText('✓ Saved!')).toBeVisible();
});
