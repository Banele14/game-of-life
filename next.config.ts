import type { NextConfig } from "next";

// Static export: no server needed. BASE_PATH is set in CI so the site works
// under /<repo>/ on GitHub Pages.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH ?? "",
};

export default nextConfig;
