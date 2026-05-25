export default {
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'eqeqeq': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
