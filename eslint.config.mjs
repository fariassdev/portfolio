import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'commitlint.config.js',
  ]),
  {
    files: ['**/*.{ts,tsx,d.ts}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          alphabetize: { order: 'asc', caseInsensitive: false },
        },
      ],
      'import/default': 'error',
      'import/extensions': 'off',
      'import/namespace': 'off',
      'import/no-unresolved': 'off',
      'import/no-dynamic-require': 'off',
      'import/named': 'off',
      'import/prefer-default-export': 'off',

      // TypeScript rules
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/quotes': [
        'warn',
        'single',
        { allowTemplateLiterals: true, avoidEscape: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false },
      ],
      '@typescript-eslint/no-inferrable-types': 'error',
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],

      // Rules explicitly turned off
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      'prefer-destructuring': 'off',
      'no-plusplus': 'off',
      'no-restricted-globals': 'off',
      'global-require': 'off',
      'no-case-declarations': 'off',
      'no-param-reassign': 'off',
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'consistent-return': 'off',
      'no-continue': 'off',
      'default-case': 'off',
      'func-names': 'off',
      'prefer-regex-literals': 'off',
      'no-promise-executor-return': 'off',
      'default-param-last': 'off',
    },
  },
  prettier,
]);

export default eslintConfig;
