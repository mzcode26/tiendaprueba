const base = require('./base.js');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
