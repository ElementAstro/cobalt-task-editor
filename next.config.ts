import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isTauriDev = !!process.env.TAURI_DEV_HOST;

const internalHost = process.env.TAURI_DEV_HOST || "localhost";

// Enable static export for Tauri production builds.
// This makes `pnpm build` generate the `out/` directory that Tauri loads from `src-tauri/tauri.conf.json` (frontendDist: "../out").
const nextConfig: NextConfig = {
  output: "export",
  // Note: This feature is required to use the Next.js Image component in SSG mode.
  // See https://nextjs.org/docs/messages/export-image-api for different workarounds.
  images: {
    unoptimized: true,
  },
  // Configure assetPrefix only for Tauri dev mode (when TAURI_DEV_HOST is set).
  // For regular browser dev mode, don't set assetPrefix to avoid CORS issues.
  assetPrefix: isProd
    ? undefined
    : isTauriDev
      ? `http://${internalHost}:3000`
      : undefined,
};

export default nextConfig;
