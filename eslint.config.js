import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Flat ESLint config. `next lint` is deprecated in Next 15 and removed in 16, so the project
 * calls ESLint directly and owns its rule set.
 */
export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript resolves every identifier itself; ESLint's version only produces
      // false positives on DOM and Node globals.
      'no-undef': 'off',
    },
  },
  {
    // Build and validation scripts run under Node, and the Playwright ones also
    // contain `page.evaluate` callbacks that execute in the browser — so both
    // sets of globals are legitimate here.
    files: ['scripts/**/*.mjs', '*.config.mjs', '*.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly',
        document: 'readonly',
        getComputedStyle: 'readonly',
        IntersectionObserver: 'readonly',
      },
    },
  },
);
