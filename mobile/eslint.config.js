// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/store', '../store/**', '../../store/**'],
              message: 'Direct imports from store are not allowed in UI components. Please use hooks for state access.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['services/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/**', '@/hooks/**'],
              message: 'Services should not import from components or hooks to maintain separation of concerns.',
            },
          ],
        },
      ],
    },
  },
]);
