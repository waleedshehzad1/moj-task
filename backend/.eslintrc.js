module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:security/recommended',
  ],
  plugins: [
    'security',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Disable some overly strict rules for backend development
    'no-console': 'warn',
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    
    // Security-related rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    
    // Code quality rules
    'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true }],
    'no-param-reassign': ['error', { props: false }],
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // Allow certain patterns common in Express.js
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        // Relax some rules for test files
        'no-unused-expressions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-object-injection': 'off',
      },
    },
    {
      files: ['database/migrations/**/*.js', 'database/seeders/**/*.js'],
      rules: {
        // Relax rules for database files
        'no-unused-vars': 'off',
        'func-names': 'off',
      },
    },
  ],
};
