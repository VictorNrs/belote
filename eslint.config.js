import tseslint from 'typescript-eslint';

const objectCalisthenics = {
  // Règle 1 : un seul niveau d'indentation par méthode.
  'max-depth': ['error', 1],
  // Règle 2 : pas de mot-clé else.
  'no-else-return': 'error',
  'no-restricted-syntax': [
    'error',
    { selector: 'IfStatement[alternate]', message: 'Object Calisthenics : pas de else, utilisez un retour anticipé ou le polymorphisme.' },
  ],
  // Règle 7 : garder les entités petites.
  'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 20, skipBlankLines: true, skipComments: true }],
  complexity: ['error', 6],
  'max-params': ['error', 5],
};

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/*.config.*'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['server/src/**/*.ts', 'shared/src/**/*.ts'],
    rules: objectCalisthenics,
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    rules: {
      ...objectCalisthenics,
      'max-depth': ['error', 2],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },
);
