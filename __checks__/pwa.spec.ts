
import { test, expect } from '@playwright/test';

test('PWA is installable', async ({ page, context }) => {
  // Navigate to your PWA
  await page.goto('http://localhost:5173/');

  // Create a DevTools session
  const client = await context.newCDPSession(page);

  // Ask Chrome for installability errors
  const result = await client.send('Page.getInstallabilityErrors') as {
    errors?: string[];
  };

  console.log('Installability errors:', result.errors);

  // Normalise undefined → empty array (Checkly Cloud returns {})
  const errors = result.errors ?? [];

  // Assert that there are no installability errors
  expect(errors).toEqual([]);
});

test('There should be a console.log for "Service Worker Registered"', async ({ page }) => { 
    const messages: string[] = []; 
    page.on('console', msg => { if (msg.type() === 'log') { messages.push(msg.text()); } }); 
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(1500); expect(messages).toContain('Service Worker Registered'); 
});
