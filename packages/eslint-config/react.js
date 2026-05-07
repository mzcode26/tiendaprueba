const base = require('./base.js');

module.exports = {
  ...base,
  plugins: [...(base.plugins || []), 'react', 'react-hooks'],
  extends: [...(base.extends || []), 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
