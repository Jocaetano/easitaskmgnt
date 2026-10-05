import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

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
  ...vue.configs['flat/essential'],
  {
    files: ['frontend/**/*.{js,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['backend/**/*.js', 'eslint.config.mjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
]
