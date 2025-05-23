module.exports = {
  env: {
    es2021: true,
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // Enforce some good practices
    'no-console': 'off', // Allow console in examples
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-expressions': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    // Allow global types like RequestInit, Response, etc.
    'no-undef': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.js',
    '*.d.ts',
    'jest.config.js',
  ],
}; 