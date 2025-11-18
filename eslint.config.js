// ESLint flat config pour Node.js ESM
import js from '@eslint/js';
import node from 'eslint-plugin-n';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: { n: node },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'n/no-missing-import': 'error',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-process-exit': 'off',
      'n/shebang': 'off',
    },
  },
  {
    files: ['tests/unit/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        beforeAll: 'readonly',
        afterEach: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },
  {
    files: ['tests/e2e/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
      },
    },
  },
];
