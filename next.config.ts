import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://img.youtube.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
              "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com blob:",
              "connect-src 'self' https://api.openai.com https://*.tile.openstreetmap.org https://www.youtube.com https://www.youtube-nocookie.com",
              "font-src 'self' data:",
              "worker-src blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
