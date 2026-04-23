import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "corriep5.ip.afrihost.co.za",
    "corriep5.ip.afrihost.co.za:3000",
    "*.ip.afrihost.co.za",
    "localhost"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "corriep5.ip.afrihost.co.za",
        "corriep5.ip.afrihost.co.za:3000"
      ]
    }
  }
};

export default nextConfig;

