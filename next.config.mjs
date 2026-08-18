import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  webpack(config) {
    // Vercel's production bundler must resolve employee-facing quote imports to
    // the audited Master Quote 5 catalog and pricing bridge. Relative imports
    // inside those bridge files remain untouched so the source modules do not
    // recurse back through the aliases.
    config.resolve.alias['@/data/pricingSpreadsheet'] = path.resolve(
      rootDir,
      'data/masterQuote5PricingBridge.ts',
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
        source: '/catalog',
        destination: '/homes',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
