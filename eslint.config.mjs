// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').ESLint.Plugin} */
const importXPlugin = /** @type {import('eslint').ESLint.Plugin} */ (
  /** @type {unknown} */ (importX)
);
/** @type {import('eslint').ESLint.Plugin} */
const simpleImportSortPlugin = /** @type {import('eslint').ESLint.Plugin} */ (
  /** @type {unknown} */ (simpleImportSort)
);
/** @type {import('eslint').ESLint.Plugin} */
const unusedImportsPlugin = /** @type {import('eslint').ESLint.Plugin} */ (
  /** @type {unknown} */ (unusedImports)
);
/** @type {import('eslint').ESLint.Plugin} */
const reactHooksPlugin = /** @type {import('eslint').ESLint.Plugin} */ (
  /** @type {unknown} */ (reactHooks)
);
/** @type {import('eslint').ESLint.Plugin} */
const nextESLintPlugin = /** @type {import('eslint').ESLint.Plugin} */ (
  /** @type {unknown} */ (nextPlugin)
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsTsExtensions = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx'];

const typeRestrictionSelectors = [
  {
    selector: 'TSSatisfiesExpression',
    message:
      "Uso de 'satisfies' proibido. Prefira anotação explícita, helper/factory tipado ou generics bem declarados.",
  },
];

const hardDeleteSelectors = [
  {
    selector: "UnaryExpression[operator='delete']",
    message:
      'Delete físico é proibido nesta POC. Preserve histórico com soft delete e campos deleted_at, deleted_by e version.',
  },
  {
    selector:
      'CallExpression[callee.property.name=/^(delete|deleteOne|deleteMany|destroy|remove|findOneAndDelete|findByIdAndDelete|findOneAndRemove|findByIdAndRemove)$/]',
    message: 'Delete físico é proibido nesta POC. Modele remoção via soft delete e auditoria.',
  },
];

const controllerRestrictedImports = [
  {
    group: ['apps/api/src/modules/*/domain/**'],
    message: 'Controller é borda de transporte; não pode importar domain diretamente.',
  },
  {
    group: ['apps/api/src/modules/*/repositories/**'],
    message: 'Controller não pode acessar repositories diretamente; delegue ao service.',
  },
  {
    group: ['apps/api/src/modules/*/mappers/**'],
    message: 'Controller não deve depender de mappers internos do módulo.',
  },
  {
    group: ['apps/api/src/infra/**'],
    message: 'Controller não pode falar com infra diretamente; use service + adapters.',
  },
];

const serviceRestrictedImports = [
  {
    group: ['apps/api/src/modules/*/controllers/**'],
    message: 'Service não deve importar controller.',
  },
  {
    group: ['apps/api/src/infra/transport/**'],
    message: 'Service não deve depender da camada de transporte.',
  },
];

const domainRestrictedImports = [
  {
    group: ['apps/api/src/modules/*/controllers/**'],
    message: 'Domain não pode depender de controller.',
  },
  {
    group: ['apps/api/src/modules/*/services/**'],
    message: 'Domain não pode depender de service.',
  },
  {
    group: ['apps/api/src/modules/*/repositories/**'],
    message: 'Domain não pode depender de repository.',
  },
  {
    group: ['apps/api/src/infra/**'],
    message: 'Domain não pode depender de infraestrutura.',
  },
  {
    group: ['apps/web/**'],
    message: 'Domain não pode depender do frontend.',
  },
];

const repositoryRestrictedImports = [
  {
    group: ['apps/api/src/modules/*/controllers/**'],
    message: 'Repository não pode depender de controller.',
  },
  {
    group: ['apps/web/**'],
    message: 'Repository não pode depender do frontend.',
  },
];

const contractRestrictedImports = [
  {
    group: ['apps/api/**'],
    message: 'packages/contracts não pode depender da aplicação da API.',
  },
  {
    group: ['apps/web/**'],
    message: 'packages/contracts não pode depender da aplicação web.',
  },
];

const webRestrictedImports = [
  {
    group: ['apps/api/**'],
    message: 'A web não deve importar a API diretamente; compartilhe tipos em packages/contracts.',
  },
];

const pathResolve = path.resolve(__dirname, 'apps/api/tsconfig.json');

export default defineConfig([
  {
    ignores: [
      '**/eslint.config.mjs',
      '**/prettier.config.mjs',
      '**/*.config.mjs',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/*.d.ts',
    ],
  },

  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: ['apps/**/*.{ts,tsx,mts,cts}', 'packages/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  {
    files: ['apps/api/**/*.{ts,js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  {
    files: ['apps/**/*.{ts,tsx,js,jsx,mjs,cjs}', 'packages/**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: {
      boundaries,
      'import-x': importXPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'unused-imports': unusedImportsPlugin,
      sonarjs,
      unicorn,
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: [pathResolve],
          alwaysTryTypes: true,
        }),
        createNodeResolver({
          extensions: jsTsExtensions,
        }),
      ],
      'boundaries/include': ['apps/**/*', 'packages/**/*'],
      'boundaries/ignore': ['**/*.spec.*', '**/*.test.*', 'apps/api/test/**/*'],
      'boundaries/elements': [
        {
          type: 'api-controller',
          pattern: 'apps/api/src/modules/*/controllers/**/*',
          capture: ['module'],
        },
        {
          type: 'api-controller',
          pattern: 'apps/api/src/modules/*/*.controller.ts',
          capture: ['module'],
          mode: 'file',
        },
        {
          type: 'api-service',
          pattern: 'apps/api/src/modules/*/services/**/*',
          capture: ['module'],
        },
        {
          type: 'api-service',
          pattern: 'apps/api/src/modules/*/*.service.ts',
          capture: ['module'],
          mode: 'file',
        },
        {
          type: 'api-domain',
          pattern: 'apps/api/src/modules/*/domain/**/*',
          capture: ['module'],
        },
        {
          type: 'api-repository',
          pattern: 'apps/api/src/modules/*/repositories/**/*',
          capture: ['module'],
        },
        {
          type: 'api-repository',
          pattern: 'apps/api/src/modules/*/*.repository.ts',
          capture: ['module'],
          mode: 'file',
        },
        {
          type: 'api-dto',
          pattern: 'apps/api/src/modules/*/dto/**/*',
          capture: ['module'],
        },
        {
          type: 'api-mapper',
          pattern: 'apps/api/src/modules/*/mappers/**/*',
          capture: ['module'],
        },
        {
          type: 'api-module-root',
          pattern: 'apps/api/src/modules/*/*.module.ts',
          capture: ['module'],
          mode: 'file',
        },
        {
          type: 'api-app-root',
          pattern: 'apps/api/src/app.module.ts',
          mode: 'file',
        },
        {
          type: 'api-infra-persistence',
          pattern: 'apps/api/src/infra/persistence/**/*',
        },
        {
          type: 'api-infra-persistence',
          pattern: 'apps/api/src/mongodb/**/*',
        },
        {
          type: 'api-infra-llm',
          pattern: 'apps/api/src/infra/llm/**/*',
        },
        {
          type: 'api-infra-streaming',
          pattern: 'apps/api/src/infra/streaming/**/*',
        },
        {
          type: 'api-infra-transport',
          pattern: 'apps/api/src/infra/transport/**/*',
        },
        {
          type: 'api-infra-observability',
          pattern: 'apps/api/src/infra/observability/**/*',
        },
        {
          type: 'api-config',
          pattern: 'apps/api/src/config/**/*',
        },
        {
          type: 'contracts',
          pattern: 'apps/packages/contracts/**/*',
        },
        {
          type: 'shared-package',
          pattern: 'apps/packages/shared/**/*',
        },
        {
          type: 'web-app',
          pattern: 'apps/web/src/app/**/*',
        },
        {
          type: 'web-feature',
          pattern: 'apps/web/src/features/*/**/*',
          capture: ['feature'],
        },
        {
          type: 'web-component',
          pattern: 'apps/web/src/components/**/*',
        },
        {
          type: 'web-hook',
          pattern: 'apps/web/src/hooks/**/*',
        },
        {
          type: 'web-service',
          pattern: 'apps/web/src/services/**/*',
        },
        {
          type: 'web-lib',
          pattern: 'apps/web/src/lib/**/*',
        },
      ],
    },
    rules: {
      'sort-imports': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'import-x/first': 'error',
      'import-x/newline-after-import': ['error', { count: 1 }],
      'import-x/no-duplicates': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: false }],
      'import-x/export': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-unresolved': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 1, ignoreExternal: true }],

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^react$', '^next', '^@?\\w'],
            ['^(~|#|src|@contracts|@shared)(/.*|$)'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown': 'error',
      'boundaries/no-private': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'api-controller',
              allow: ['api-service', 'api-dto', 'contracts', 'shared-package', 'api-config'],
            },
            {
              from: 'api-service',
              allow: [
                'api-domain',
                'api-repository',
                'api-dto',
                'api-mapper',
                'contracts',
                'shared-package',
                'api-infra-persistence',
                'api-infra-llm',
                'api-infra-streaming',
                'api-infra-observability',
                'api-config',
              ],
            },
            {
              from: 'api-domain',
              allow: ['contracts', 'shared-package'],
            },
            {
              from: 'api-repository',
              allow: [
                'api-domain',
                'contracts',
                'shared-package',
                'api-config',
                'api-infra-persistence',
              ],
            },
            {
              from: 'api-dto',
              allow: ['contracts', 'shared-package'],
            },
            {
              from: 'api-mapper',
              allow: ['api-domain', 'api-dto', 'contracts', 'shared-package'],
            },
            {
              from: 'api-module-root',
              allow: [
                'api-controller',
                'api-service',
                'api-domain',
                'api-repository',
                'api-dto',
                'api-mapper',
                'contracts',
                'shared-package',
                'api-config',
                'api-infra-persistence',
              ],
            },
            {
              from: 'api-app-root',
              allow: ['api-module-root', 'api-infra-persistence', 'api-config'],
            },
            {
              from: 'api-infra-persistence',
              allow: [
                'api-infra-persistence',
                'api-domain',
                'api-repository',
                'api-mapper',
                'contracts',
                'shared-package',
                'api-config',
              ],
            },
            {
              from: 'api-infra-llm',
              allow: ['contracts', 'shared-package', 'api-config'],
            },
            {
              from: 'api-infra-streaming',
              allow: ['contracts', 'shared-package', 'api-config'],
            },
            {
              from: 'api-infra-transport',
              allow: ['contracts', 'shared-package', 'api-config'],
            },
            {
              from: 'api-infra-observability',
              allow: ['contracts', 'shared-package', 'api-config'],
            },
            {
              from: 'api-config',
              allow: ['shared-package', 'contracts'],
            },
            {
              from: 'contracts',
              allow: ['shared-package'],
            },
            {
              from: 'shared-package',
              allow: [],
            },
            {
              from: 'web-app',
              allow: [
                'web-feature',
                'web-component',
                'web-hook',
                'web-service',
                'web-lib',
                'contracts',
                'shared-package',
              ],
            },
            {
              from: 'web-feature',
              allow: [
                'web-component',
                'web-hook',
                'web-service',
                'web-lib',
                'contracts',
                'shared-package',
              ],
            },
            {
              from: 'web-component',
              allow: ['web-component', 'web-hook', 'web-lib', 'contracts', 'shared-package'],
            },
            {
              from: 'web-hook',
              allow: ['web-hook', 'web-lib', 'contracts', 'shared-package'],
            },
            {
              from: 'web-service',
              allow: ['web-lib', 'contracts', 'shared-package'],
            },
            {
              from: 'web-lib',
              allow: ['contracts', 'shared-package'],
            },
          ],
        },
      ],

      'unicorn/prefer-node-protocol': 'error',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/expiring-todo-comments': 'off',

      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/no-identical-functions': 'warn',

      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-catch': 'warn',
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
      '@next/next': nextESLintPlugin,
    },
    settings: {
      next: {
        rootDir: 'apps/web/',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
    },
  },

  {
    files: ['apps/**/*.{ts,tsx,mts,cts}', 'packages/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never',
        },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-restricted-imports': 'off',
      'no-restricted-imports': 'off',
      'no-restricted-syntax': ['error', ...typeRestrictionSelectors],
    },
  },

  {
    files: ['apps/api/**/*.{ts,tsx,mts,cts}'],
    rules: {
      'no-restricted-syntax': ['error', ...typeRestrictionSelectors, ...hardDeleteSelectors],
    },
  },

  {
    files: ['apps/api/src/modules/*/controllers/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: controllerRestrictedImports,
        },
      ],
    },
  },
  {
    files: ['apps/api/src/modules/*/*.controller.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: controllerRestrictedImports,
        },
      ],
    },
  },

  {
    files: ['apps/api/src/modules/*/services/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: serviceRestrictedImports,
        },
      ],
    },
  },
  {
    files: ['apps/api/src/modules/*/*.service.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: serviceRestrictedImports,
        },
      ],
    },
  },

  {
    files: ['apps/api/src/modules/*/domain/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: domainRestrictedImports,
        },
      ],
    },
  },

  {
    files: [
      'apps/api/src/modules/*/repositories/**/*.{ts,tsx,mts,cts}',
      'apps/api/src/modules/*/*.repository.ts',
      'apps/api/src/infra/persistence/**/*.{ts,tsx,mts,cts}',
      'apps/api/src/mongodb/**/*.{ts,tsx,mts,cts}',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: repositoryRestrictedImports,
        },
      ],
    },
  },
  {
    files: ['apps/api/src/**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: [
      'apps/api/src/app.module.ts',
      'apps/api/src/mongodb/**/*.{ts,tsx,mts,cts}',
      'apps/api/src/modules/*/*.repository.ts',
    ],
    rules: {
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
      'boundaries/no-private': 'off',
      'boundaries/element-types': 'off',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  },

  {
    files: ['packages/contracts/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: contractRestrictedImports,
        },
      ],
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: webRestrictedImports,
        },
      ],
    },
  },

  {
    files: ['apps/**/*.{js,jsx,mjs,cjs}', 'packages/**/*.{js,jsx,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
    },
  },

  eslintConfigPrettier,
]);
