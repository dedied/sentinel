import { TestCase, TestType, TestStatus } from '../../types';

export const supabaseQueryTest: TestCase = {
  id: 'test_2',
  title: 'Supabase User Query',
  description: 'Ensure the users table returns the correct profile for a given UUID.',
  type: TestType.BACKEND,
  status: TestStatus.IDLE,
  code: `import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

test('Supabase User Query', async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', '123e4567-e89b-12d3-a456-426614174000')
    .single();

  expect(error).toBeNull();
  expect(data).toHaveProperty('username');
  expect(data.is_active).toBe(true);
});`,
  lastRun: null,
  logs: []
};
