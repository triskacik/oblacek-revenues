import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import noHardcodedQueryKey from './eslint-rules/no-hardcoded-query-key.js'

export default defineConfig([
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist', 'src/routeTree.gen.ts', 'src/types/supabase.gen.ts', 'supabase'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh.plugin,
      oblacek: {
        rules: {
          'no-hardcoded-query-key': noHardcodedQueryKey,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // 🔹 React "recommended" rules
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',

      // 🔹 React "jsx-runtime" rule
      'react/react-in-jsx-scope': 'off',

      // 🔹 React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // 🔹 React Refresh rule
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          extraHOCs: ['createRootRouteWithContext', 'createFileRoute'],
        },
      ],

      // 🔹 House style (same as benefit-ng-react)
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-pascal-case': 'error',
      'react/jsx-sort-props': [
        'error',
        { callbacksLast: true, shorthandFirst: true, ignoreCase: true },
      ],
      'react/self-closing-comp': 'error',
      'react/prop-types': 'off',
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'sonner',
              importNames: ['toast'],
              message: "Use `import { toast } from '@/lib/toast'`.",
            },
          ],
        },
      ],
      'oblacek/no-hardcoded-query-key': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
