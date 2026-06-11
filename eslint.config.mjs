import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "web/.next/**",
      "mobile/.expo/**",
    ],
  },
  {
    files: ["web/**/*.{ts,tsx}"],
    extends: [...compat.extends("next/core-web-vitals", "next/typescript")],
  },
  {
    files: ["mobile/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
  },
);
