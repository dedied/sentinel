import { Project } from './types';
import { loginFlowTest } from './tests/fitTrack/loginFlow';
import { supabaseQueryTest } from './tests/fitTrack/supabaseQuery';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'FitTrack',
    description: 'Fitness tracking application with social features.',
    tests: [
      loginFlowTest,
      supabaseQueryTest
    ]
  },
  {
    id: 'proj_2',
    name: 'E-Com Store',
    description: 'Next.js e-commerce storefront.',
    tests: []
  }
];
