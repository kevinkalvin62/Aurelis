const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

module.exports = defineConfig([
  globalIgnores([
    ".expo/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "src/types/database.generated.ts",
  ]),
  expoConfig,
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
