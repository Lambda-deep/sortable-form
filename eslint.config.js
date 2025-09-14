import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
    // 基本的なJavaScript推奨ルール
    js.configs.recommended,
    
    // TypeScript用の設定
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                // ブラウザ環境のグローバル変数
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                // Node.js環境のグローバル変数
                process: 'readonly',
                Buffer: 'readonly',
                // Web API
                Request: 'readonly',
                Response: 'readonly',
                Headers: 'readonly',
                HTMLDivElement: 'readonly',
                HTMLElement: 'readonly',
                Event: 'readonly',
                EventTarget: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'react': react,
            'react-hooks': reactHooks,
        },
        rules: {
            // TypeScript推奨ルール
            ...tseslint.configs.recommended.rules,
            
            // 未使用変数・関数の警告
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'no-unused-vars': 'off',
            
            // React関連ルール
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            
            // TypeScript関連の調整
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    
    // Prettier設定（最後に配置して他のルールを上書き）
    prettier,
    
    // 無視するファイルとディレクトリ
    {
        ignores: [
            'build/**',
            'public/build/**',
            'node_modules/**',
            'test-results/**',
            'playwright-report/**',
            'tests/**',
            '*.config.js',
            '*.config.ts',
            'vite.config.ts',
            'playwright.config.ts',
            '.env*',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            '.vscode/**',
            '.idea/**',
            '.DS_Store',
            'Thumbs.db',
            '.remix/**',
            '.prettierrc.cjs',
        ],
    },
];
