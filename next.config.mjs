import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  webpack(config) {
    // Vercel's production bundler was resolving these two application imports
    // to the legacy physical files even though tsconfig paths redirected them
    // during local/GitHub builds. Force the application-facing requests to the
    // audited Master Quote 5 runtime layers. Keep relative imports untouched so
    // those layers can still read the legacy files as source/reference data
    // without creating circular aliases.
    config.resolve.alias['@/data/pricingSpreadsheet'] = path.resolve(
      rootDir,
      'data/masterQuote5RuntimeBridge.ts',
    );
    config.resolve.alias['@/data/fullMasterCatalog.generated'] = path.resolve(
      rootDir,
      'data/masterQuote5CatalogGuard.ts',
    );
    return config;
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
