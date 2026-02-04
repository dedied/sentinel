import { test, expect } from '@playwright/test';

test('login with Supabase OTP using Mailinator', async ({ page, context }) => {
  // 1. Create random inbox
  const inbox = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const email = `${inbox}@mailinator.com`;

  // 2. Trigger OTP in your app (main tab)
  const app = page;
  await app.goto('http://localhost:5173/');
  await app.getByRole('button', { name: 'Sign In for Cloud Sync' }).click();
  await app.getByRole('textbox', { name: 'Enter your email' }).fill(email);
  await app.getByRole('button', { name: 'Send Code' }).click();

  // 3. Open Mailinator in a NEW TAB
  const mailPage = await context.newPage();
  await mailPage.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${inbox}`);

  // 4. Wait for the OTP email to arrive
  const cell = mailPage.locator('td', { hasText: 'Your One Time Code' });
  await expect(cell).toBeVisible({ timeout: 15000 });

  // 5. Open the email
  await cell.click();

  // 6. Extract OTP from iframe
  const iframe = mailPage.frameLocator('#html_msg_body');
  await iframe.locator('body').waitFor();

  const bodyText = await iframe.locator('body').innerText();
  const match = bodyText.match(/\d{6}/);
  if (!match) throw new Error('OTP not found in email body');

  const otp = match[0];
  console.log('Extracted OTP:', otp);

  // 7. Return to your app tab (no reload)
  await app.bringToFront();
  await app.getByPlaceholder('6-digit code').fill(otp);
  await app.getByRole('button', { name: 'Verify Code' }).click();

  // 8. Assert login success
  await expect(app.getByText('Premium Required')).toBeVisible();
});
