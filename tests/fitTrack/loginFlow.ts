import { TestCase, TestType, TestStatus } from '../../types';

export const loginFlowTest: TestCase = {
  id: 'test_1',
  title: 'User Login Flow',
  description: 'Verify that a user can log in with valid credentials and is redirected to the dashboard.',
  type: TestType.FRONTEND,
  status: TestStatus.PASSED,
  code: `import { test, expect } from '@playwright/test';

test('User Login Flow', async ({ page }) => {
  await page.goto('https://fittrack.app/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('https://fittrack.app/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome back');
});`,
  lastRun: new Date(Date.now() - 3600000).toISOString(),
  duration: 1200,
  logs: ['Navigating to login...', 'Filling credentials...', 'Asserting URL...']
};
