import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '**/node_modules/**',
      'frontend/dist/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
  },
  ...tseslint.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['frontend/**/*.{js,ts,vue}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['backend/**/*.{js,ts}', 'shared/**/*.ts', 'eslint.config.mjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
]
