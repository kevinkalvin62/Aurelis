const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

module.exports = defineConfig([
  globalIgnores([
    "**/.expo/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
    "apps/mobile/src/types/database.generated.ts",
  ]),
  expoConfig,
  {
    settings: {
      "import/resolver": {
        typescript: { project: "apps/mobile/tsconfig.json" },
      },
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["apps/landing/**/*.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]);
