import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Listing photos are remote picsum URLs or local uploads rendered at many sizes;
      // plain <img> with lazy loading keeps the replica dependency-free.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
