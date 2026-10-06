import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Listing photos will live in S3/R2 once uploads are real (see CLAUDE.md "Known gaps").
    // The storage domain isn't decided yet. A wildcard `remotePatterns: [{ hostname: "**" }]`
    // would turn next/image's optimizer into an open proxy for any HTTPS URL (SSRF), so
    // optimization stays off until a real bucket/CDN hostname is chosen and can be allow-listed.
    unoptimized: true,
  },
};

export default nextConfig;
