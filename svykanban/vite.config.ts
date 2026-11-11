/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({ tsconfig: 'projects/svykanban/tsconfig.spec.json' })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['projects/svykanban/src/**/*.spec.ts'],
    setupFiles: ['projects/svykanban/src/setup-test.ts'],
    coverage: {
      provider: 'v8',
      // TS-only coverage of the component sources, matching the other Servoy repos.
      // Unlike the Angular unit-test builder, raw Vitest honors include/exclude here.
      include: ['projects/svykanban/src/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/setup-test.ts',
        '**/testingutils.ts',
        '**/public-api.ts',
      ],
      reporter: ['text-summary', 'json-summary', 'lcov', 'cobertura'],
      // Match the <project> subfolder layout the other repos' aggregator expects.
      reportsDirectory: 'coverage/@servoy/svykanban',
    },
  },
});
