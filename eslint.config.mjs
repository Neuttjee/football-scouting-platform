import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Project-specific rule overrides (keep CI praktisch).
  {
    rules: {
      // We gebruiken op veel plekken nog `any`; maak dit voorlopig een warning.
      "@typescript-eslint/no-explicit-any": "warn",

      // React 19 compiler-specifieke regels die nu veel noise geven bij TanStack Table e.d.
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",

      // Toegestane plain tekst met quotes in copy; kan later gericht worden aangescherpt.
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
