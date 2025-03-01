import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "image.tmdb.org",
      "images.igdb.com",
      "books.google.com",
      "i.scdn.co",
      "comicvine.gamespot.com",
      'lastfm.freetls.fastly.net',
      'i.iheart.com',
      'lastfm-img2.akamaized.net'
    ],
  },
};

export default nextConfig;