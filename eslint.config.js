// ESLint flat config for Node 22+, TypeScript, and clean-code leaning rules
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';

export default [
  {
    files: ['**/*.ts']
  },
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: false
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: pluginImport,
      n: pluginN,
      promise: pluginPromise
    },
    rules: {
      // TypeScript recommended (non type-checked to avoid project requirement)
      ...tseslint.configs.recommended.rules,

      // Node and import hygiene
      'n/no-unsupported-features/node-builtins': 'off',
      'import/order': ['warn', { 'newlines-between': 'always' }],

      // Clean code leaning constraints
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 4],
      'complexity': ['warn', 12],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],

      // Promises
      'promise/no-return-wrap': 'error',
      'promise/always-return': 'off',

      // TS specific tweaks
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }]
    }
  }
];
