import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/product",
        destination: "/en",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
