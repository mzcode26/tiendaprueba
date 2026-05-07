module.exports = {
  root: true,
  extends: ['./packages/eslint-config/base.js'],
  ignorePatterns: ['node_modules', 'dist', 'build', '.turbo', 'coverage'],
  overrides: [
    {
      files: ['apps/api/**/*.ts', 'packages/**/*.ts'],
      extends: ['./packages/eslint-config/nestjs.js'],
    },
    {
      files: ['apps/admin-web/**/*.{ts,tsx}'],
      extends: ['./packages/eslint-config/react.js'],
    },
  ],
};
