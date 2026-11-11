import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";
import { defineConfig } from "eslint/config";

/**
 * Layer-boundary rules. Each entry names what a layer must not import; the
 * allowed direction is documented in AGENTS.md.
 */
const boundary = (files, forbidden) => ({
  files,
  rules: {
    "no-restricted-imports": ["error", { patterns: forbidden }],
  },
});

const APP_CODE = {
  group: ["@/*"],
  message: "Shared layers must not import app code.",
};
const UI_LAYER = {
  group: ["@components", "@components/*"],
  message: "Services and lower layers must not import UI.",
};
const SERVICE_LAYER = {
  group: ["@services", "@services/*"],
  message: "Only app code may import @services.",
};
const DEEP_IMPORT = {
  group: [
    "@services/*",
    "!@services/auth",
    "@models/*",
    "@dtos/*",
    "@utils/*",
    "@enums/*",
    "@assets/*",
  ],
  message:
    "Import from the layer root alias, not a deep path (`@services/auth/server` is the one exception).",
};

export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/next-env.d.ts",
      "tools/generators/**/files/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { js },
    rules: { ...js.configs.recommended.rules },
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: { parser: tsParser },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { react: reactPlugin },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  },
  // Layer boundaries (see AGENTS.md). App code under src/ (outside src/shared) may import every layer.
  boundary(["src/shared/**/*.{ts,tsx}"], [APP_CODE, DEEP_IMPORT]),
  boundary(["src/shared/services/**/*.{ts,tsx}"], [UI_LAYER]),
  boundary(["src/shared/components/**/*.{ts,tsx}"], [SERVICE_LAYER]),
  boundary(
    ["src/shared/models/**/*.{ts,tsx}", "src/shared/dtos/**/*.{ts,tsx}"],
    [
      UI_LAYER,
      SERVICE_LAYER,
      { group: ["@utils", "@utils/*"], message: "Models and DTOs stay pure." },
    ]
  ),
  boundary(
    ["src/shared/utils/**/*.{ts,tsx}", "src/shared/enums/**/*.{ts,tsx}"],
    [
      UI_LAYER,
      SERVICE_LAYER,
      {
        group: ["@models", "@models/*", "@dtos", "@dtos/*", "@assets", "@assets/*"],
        message: "utils and enums are leaf layers.",
      },
    ]
  ),
  // Tooling scripts and the mock API run in Node and may log.
  {
    files: ["tools/**/*.{js,mjs,ts}", "next.config.js", "postcss.config.js", "jest.config.cjs"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "no-console": "off" },
  },
]);
