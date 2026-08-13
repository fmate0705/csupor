import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // `server-only` throws by design outside a React Server Component
      // environment. Under test we are exercising the module's logic directly,
      // so it is stubbed out.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
      // Mirrors the "@/*" path alias in tsconfig.json so tests import exactly
      // as the app does. Must come after the more specific alias above.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    // Default to node; component tests opt into jsdom with a per-file docblock.
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
