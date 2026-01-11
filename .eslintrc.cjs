module.exports = {
  ignorePatterns: ['dist/','node_modules/','test-results/'],
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  globals: {
    clients: 'readonly'
  },
  overrides: [
    {
      files: ['tests/**/*.js', 'e2e/**/*.ts'],
      globals: {
        describe: 'readonly', it: 'readonly', expect: 'readonly', beforeAll: 'readonly', afterAll: 'readonly', vi: 'readonly'
      },
      rules: { 'no-prototype-builtins': 'off' }
    }
  ],
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {}
}
