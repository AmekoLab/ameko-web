import type { NextConfig } from "next";

// Allow self-signed certs in development (for server-side fetch to https://localhost)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Cho phép tất cả ảnh từ cloudinary
      },
    ],
  },
};

export default nextConfig;
