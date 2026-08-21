/** Future art object-storage host. Set ART_IMAGE_HOST (hostname only, e.g. "images.example.com")
 *  and rebuild — next/image will then optimize remote gallery images from that host. To point
 *  at a real host later, define ART_IMAGE_HOST in the build environment; no code change needed. */
const artImageHost = process.env.ART_IMAGE_HOST;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: artImageHost
      ? [{ protocol: 'https', hostname: artImageHost, pathname: '/**' }]
      : [],
  },
};

export default nextConfig;
