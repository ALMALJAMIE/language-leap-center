import type { NextConfig } from "next";

// عند النشر على GitHub Pages يكون الموقع تحت مسار المستودع (/language-leap-center)
// وعند شراء الدومين لاحقًا اترك NEXT_PUBLIC_BASE_PATH فارغًا.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
