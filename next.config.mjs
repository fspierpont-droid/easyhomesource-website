/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/',
        permanent: false,
      },
      {
        // Redirect old Trove catalog links to our new homes page
        source: '/catalog',
        destination: '/homes',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
