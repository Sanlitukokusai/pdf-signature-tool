import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯客户端 PDF 工具，静态导出 → 由静态服务器托管，运行内存 ~57MB 降至 ~5MB（不改功能）
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    resolveAlias: {
      // Fix for react-pdf: prevent canvas module resolution on server
      canvas: { browser: "canvas" },
    },
  },
};

export default nextConfig;
