import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Fix for react-pdf: prevent canvas module resolution on server
      canvas: { browser: "canvas" },
    },
  },
};

export default nextConfig;
