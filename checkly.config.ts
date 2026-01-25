import { defineConfig } from 'checkly'

export default defineConfig({
  projectName: 'FitTrack Pro Monitoring',
  logicalId: 'fittrack-pro-monitoring',
  repoUrl: 'https://github.com/checkly/checkly-cli',

  checks: {
    checkMatch: '**/__checks__/**/*.check.ts',
    browserChecks: {
      testMatch: '**/__checks__/**/*.spec.ts',
    },
  },

  cli: {
    runLocation: 'eu-central-1',
    reporters: ['list'],
    retries: 0,
  },
})
