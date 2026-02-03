import { test, expect } from '@playwright/test';

test('login with Supabase OTP using Mailinator', async ({ page }) => {
  // 1. Create random inbox
  const inbox = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const email = `${inbox}@mailinator.com`;

  // 2. Trigger OTP in your app
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Sign In for Cloud Sync' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).fill(`${email}`);
  await page.getByRole('button', { name: 'Send Code' }).click();

  // 3. Open Mailinator inbox
  await page.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${inbox}`);

  // 4. Wait for email

  const secondTd = page.locator('table tbody tr:nth-of-type(1) td:nth-of-type(2)');

  await page.waitForSelector('.message-item', { timeout: 30000 });

  // 5. Open latest email
  await page.locator('.message-item').first().click();

  // 6. Extract OTP from iframe
  const iframe = page.frameLocator('#msg_body');
  const bodyText = await iframe.locator('body').innerText();
  const otp = bodyText.match(/\b\d{6}\b/)[0];

  console.log('Extracted OTP:', otp);

  // 7. Use OTP in your app
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Enter your OTP' }).fill(otp);
  await page.getByRole('button', { name: 'Verify OTP' }).click();

  // 8. Assert login success
  await expect(page.locator('.dashboard')).toBeVisible();
});
