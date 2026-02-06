
import { test, expect } from '@playwright/test';

test('The Cloud Sync status label on the left-hand menu should render exactly (taking note of capitalization) "Upgrade to Premium" when disconnected', async ({ context }) => {
  const page = await context.newPage()

  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await expect(page.getByText('Upgrade to Premium',{exact: true})).toBeVisible();
});
