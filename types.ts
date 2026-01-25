export enum TestType {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
}

export enum TestStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: TestType;
  status: TestStatus;
  code: string | null;
  lastRun: string | null;
  duration?: number; // in ms
  logs: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
}

export type ViewMode = 'DASHBOARD' | 'TESTS';

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
}