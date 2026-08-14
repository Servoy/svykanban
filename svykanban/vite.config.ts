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
  },
});
