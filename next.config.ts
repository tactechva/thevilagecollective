import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Lets a production build run into its own directory while a dev server is
    live. Without it, `next build` writes to the same .next the dev server is
    serving from and pulls the rug out: the running site starts throwing 500s and
    losing its stylesheet until dev is restarted. Verifying a build should not
    break the thing you are looking at.
  */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "static.wixstatic.com" }],
  },
};

export default nextConfig;
