import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    extends: compat.extends(
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended'
    ),

    plugins: {
      prettier
    },

    settings: {
      'import/resolver': {
        alias: true
      }
    },

    rules: {
      '@typescript-eslint/no-empty-object-type': 0,

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],

      'react-hooks/exhaustive-deps': 0,

      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true
        }
      ]
    }
  }
]);
