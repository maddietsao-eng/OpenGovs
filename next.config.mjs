/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  outputFileTracingIncludes: {
    "/api/chat": ["./data/**/*"],
  },
};

export default nextConfig;
