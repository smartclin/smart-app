import initializeBundleAnalyzer from '@next/bundle-analyzer';
import withSimpleAnalytics from '@simpleanalytics/next/plugin';
import type { NextConfig } from 'next';

// Initialize Bundle Analyzer conditionally
const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

const isProd = process.env.NODE_ENV === 'production';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
  // Use NextConfig directly
  // Top-level configurations
  eslint: {
    // Enforce ESLint during builds for better code quality assurance.
    // It's recommended to fix lint errors before deployment.
    ignoreDuringBuilds: false // Changed from true to false
  },
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Image Optimization Configuration
  images: {
    unoptimized: false,
    remotePatterns: [
      // Ensure these hostnames are valid and necessary for your production environment.
      // Remove 'localhost' if not serving images from local source in production.
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh'
      },
      {
        protocol: 'https',
        hostname: 'ufs.sh'
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increased cache TTL for production to improve performance.
    minimumCacheTTL: isProd ? 86400 : 60, // 1 day in production, 60s in dev

    // Use with extreme caution. Disable if you don't explicitly need scriptable SVGs.
    dangerouslyAllowSVG: true,

    // Change to 'inline' for most web images to be displayed directly.
    contentDispositionType: 'inline', // Changed from attachment to inline

    // More robust Content Security Policy for images.
    // Adjust `img-src` to include all necessary image origins.
    // Ensure this aligns with your `dangerouslyAllowSVG` choice.
    contentSecurityPolicy: isProd
      ? "default-src 'self'; script-src 'none'; img-src 'self' data: https://lh3.googleusercontent.com https://avatar.vercel.sh https://ufs.sh https://*.ufs.sh https://avatars.githubusercontent.com https://images.unsplash.com;"
      : "default-src 'self'; script-src 'none'; img-src 'self' data: http://localhost:3000 https://lh3.googleusercontent.com https://avatar.vercel.sh https://ufs.sh https://*.ufs.sh https://avatars.githubusercontent.com https://images.unsplash.com;"
  },

  // Compiler options (SWC)
  compiler: {
    removeConsole: isProd ? { exclude: ['error'] } : false
  },

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false
  },

  // Asset Prefix for CDN integration (usually only for non-Vercel deployments)
  assetPrefix: isProd ? undefined : 'http://localhost:3000',

  // Experimental features for performance and build optimization
  experimental: {
    optimizeCss: isProd,
    optimizeServerReact: isProd,
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      '@radix-ui/react-icons',
      'react-icons',
      'framer-motion',
      '@headlessui/react',
      // Removed '@tailwindcss/postcss' as it typically doesn't benefit from this optimization
      'date-fns',
      '@tabler/icons-react',
      'lodash',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'react-hook-form',
      'react-markdown',
      'ai'
    ],
    memoryBasedWorkersCount: true,
    serverMinification: true
  },

  // Turbopack specific configuration
  turbopack: {
    rules: {
      // Note: This rule currently only supports SVGs as components.
      // Conditional loading for '?url' with Turbopack may require further investigation
      // or a different approach if direct SVG URLs are needed in --turbo dev mode.
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  }
};

// Compose plugins: Simple Analytics first, then Bundle Analyzer.
const withSimpleAnalyticsNext = withSimpleAnalytics(nextConfig);

// Export the final composed configuration
export default withBundleAnalyzer(withSimpleAnalyticsNext);
