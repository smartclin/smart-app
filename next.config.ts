import initializeBundleAnalyzer from '@next/bundle-analyzer'
import withSimpleAnalytics from '@simpleanalytics/next/plugin'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
  openAnalyzer: false, // Don't auto-open in CI
})

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'lib', 'components', 'trpc', 'db', 'server'], // Specify directories to lint
  },

  // Build and deployment
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification (faster than Terser)

  // Security headers
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Image optimization
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatar.vercel.sh' },
      { protocol: 'https', hostname: 'ufs.sh' },
      { protocol: 'https', hostname: '*.ufs.sh' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' }, // For CDN assets
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: isProd ? 86400 : 60, // 24 hours in prod, 1 minute in dev
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: isProd
      ? "default-src 'self'; script-src 'none'; img-src 'self' data: https://lh3.googleusercontent.com https://avatar.vercel.sh https://ufs.sh https://*.ufs.sh https://avatars.githubusercontent.com https://images.unsplash.com https://cdn.jsdelivr.net;"
      : "default-src 'self'; script-src 'none'; img-src 'self' data: http://localhost:3000 https://lh3.googleusercontent.com https://avatar.vercel.sh https://ufs.sh https://*.ufs.sh https://avatars.githubusercontent.com https://images.unsplash.com https://cdn.jsdelivr.net;",
  },

  // Compiler optimizations
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
    reactRemoveProperties: isProd ? { properties: ['^data-testid$'] } : false,
  },

  // Experimental features for optimization
  experimental: {
    // CSS and React optimizations
    optimizeCss: isProd,
    optimizeServerReact: true, // Enable in both dev and prod for better DX

    // Package import optimizations - expanded for your stack
    optimizePackageImports: [
      // UI Libraries
      'lucide-react',
      '@heroicons/react',
      '@radix-ui/react-icons',
      'react-icons',
      '@tabler/icons-react',

      // Animation
      'framer-motion',

      // Headless UI
      '@headlessui/react',

      // Radix UI components
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
      '@radix-ui/react-slot',
      '@radix-ui/react-separator',
      '@radix-ui/react-label',
      '@radix-ui/react-switch',
      '@radix-ui/react-progress',

      // Data fetching and state management
      '@tanstack/react-query',
      '@tanstack/react-table',
      '@trpc/client',
      '@trpc/server',
      '@trpc/react-query',

      // Forms and validation
      'react-hook-form',
      '@hookform/resolvers',
      'zod',

      // Utilities
      'date-fns',
      'lodash',
      'clsx',
      'class-variance-authority',

      // Charts and visualization
      'recharts',

      // Markdown and content
      'react-markdown',
      'remark',
      'rehype',

      // AI and APIs
      'ai',

      // Database (Prisma client optimization)
      '@prisma/client',

      // Internationalization
      'next-intl',
    ],

    // Performance optimizations
    memoryBasedWorkersCount: true,
    serverMinification: isProd,

    // tRPC specific optimizations
    serverComponentsExternalPackages: ['@prisma/client'],

    // Enable PPR (Partial Prerendering) if using Next.js 14+
    ppr: false, // Set to true when ready for PPR

    // Turbopack optimizations (for dev)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack customizations for better optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate vendor chunks for better caching
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate tRPC chunk
          trpc: {
            test: /[\\/]node_modules[\\/]@trpc[\\/]/,
            name: 'trpc',
            chunks: 'all',
            priority: 20,
          },
          // Separate Prisma chunk
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'prisma',
            chunks: 'all',
            priority: 20,
          },
          // Separate Radix UI chunk
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
            priority: 15,
          },
        },
      }
    }

    // Prisma client optimization
    if (isServer) {
      config.externals.push('@prisma/client')
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for better SEO
  async redirects() {
    return [
      // Add your redirects here
    ]
  },

  // Environment variables validation
  // env: {
  //   CUSTOM_KEY: process.env.CUSTOM_KEY,
  // },
}

// Create the next-intl plugin
const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts') // Adjust path as needed

// Plugin composition order matters: Intl → SimpleAnalytics → BundleAnalyzer
export default withBundleAnalyzer(withSimpleAnalytics(withNextIntl(nextConfig)))
