import { test, expect } from '@playwright/test';

test('Check that a user can login and successfully pay', async ({ context }) => {
  const page = await context.newPage()

  // 1. Create random inbox
  const inbox = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const email = `${inbox}@mailinator.com`;

  // 2. Trigger OTP in your app (main tab)
  const app = page;
  await app.goto('http://localhost:5173/');
  await app.getByRole('button', { name: 'Sign In' }).click();
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

  // 7. Return to your app tab (no reload)
  await app.bringToFront();
  await app.getByPlaceholder('6-digit code').fill(otp);
  await app.getByRole('button', { name: 'Verify Code' }).click();

  // 8. Assert login success
  await expect(app.getByText('Premium Required')).toBeVisible();

  // 9. Proceed to payment and fill out the form
  await app.getByRole('button', { name: 'Proceed to Payment' }).click();
  await app.getByRole('button', { name: 'I Agree & Continue' }).click();
  await app.locator('#payment-method-accordion-item-title-card').check({ force: true });
  await app.getByRole('textbox', { name: 'Card number' }).click();
  await app.getByRole('textbox', { name: 'Card number' }).fill('4242 4242 4242 4242');
  await app.getByRole('textbox', { name: 'Expiration' }).click();
  await app.getByRole('textbox', { name: 'Expiration' }).fill('01 / 28');
  await app.getByRole('textbox', { name: 'CVC' }).click();
  await app.getByRole('textbox', { name: 'CVC' }).fill('123');
  await app.getByRole('textbox', { name: 'Cardholder name' }).click();
  await app.getByRole('textbox', { name: 'Cardholder name' }).fill('A Test');
  

  // Click submit and wait for Stripe Checkout to load
  await Promise.all([
    app.waitForURL(/checkout\.stripe\.com/),
    app.getByTestId('hosted-payment-submit-button').click()
  ])

  // Now wait for Stripe to redirect back to your app
  await app.waitForURL(/payment_success=true/)


  // Bring your app tab back
  await app.bringToFront()

  // 10. Assert payment success and access to premium features
  await expect(app.getByText('Welcome to Premium! Cloud Sync is now active.')).toBeVisible();

  
});

test('Check that a user can cancel payment', async ({ context }) => {
  const page = await context.newPage()

  // 1. Create random inbox
  const inbox = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const email = `${inbox}@mailinator.com`;

  // 2. Trigger OTP in your app (main tab)
  const app = page;
  await app.goto('http://localhost:5173/');
  await app.getByRole('button', { name: 'Sign In' }).click();
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

  // 7. Return to your app tab (no reload)
  await app.bringToFront();
  await app.getByPlaceholder('6-digit code').fill(otp);
  await app.getByRole('button', { name: 'Verify Code' }).click();

  // 8. Assert login success
  await expect(app.getByText('Premium Required')).toBeVisible();

  // 9. Proceed to payment and fill out the form
  await app.getByRole('button', { name: 'Proceed to Payment' }).click();
  await app.getByRole('button', { name: 'I Agree & Continue' }).click();
  await app.getByRole('link', { name: 'Back' }).click()

  // Now wait for Stripe to redirect back to your app
  await app.waitForURL(/payment_cancelled=true/)

  // Bring your app tab back
  await app.bringToFront()

  // 10. Assert payment success and access to premium features
  await expect(app.getByText('Payment Cancelled')).toBeVisible();

  
});

