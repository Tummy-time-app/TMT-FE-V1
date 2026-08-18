import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Restaurant/menu images — both our dev-mode mock data
        // (lib/mocks/restaurants.mock.ts) and TMT-BE-V1's own actual
        // seed data (restaurant-service/src/routes/restaurants.ts) use
        // Unsplash URLs for placeholder photos.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
