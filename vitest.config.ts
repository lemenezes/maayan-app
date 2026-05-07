import { mergeConfig, defineConfig as defineViteConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default mergeConfig(
  defineViteConfig({
    plugins: [react()],
  }),
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/__tests__/setup.ts'],
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      typecheck: {
        tsconfig: './tsconfig.test.json',
      },
    },
  }),
);
