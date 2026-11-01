import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/dev", destination: "/" },
      { source: "/dev/", destination: "/" },
      { source: "/prod", destination: "/" },
      { source: "/prod/", destination: "/" },
    ];
  },
};

export default nextConfig;
