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
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
];
