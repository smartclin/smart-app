import initializeBundleAnalyzer from '@next/bundle-analyzer'
import withSimpleAnalytics from '@simpleanalytics/next/plugin'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
  openAnalyzer: false,
})

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'lib', 'components', 'trpc', 'db', 'server'],
  },

  output: 'standalone',
  reactStrictMode: true,

  poweredByHeader: false,
  generateEtags: true,
  compress: true,

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
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: isProd ? 86400 : 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: isProd
      ? "default-src 'self'; script-src 'none'; img-src 'self' data: https://lh3.googleusercontent.com https://avatar.vercel.sh https://ufs.sh https://*.ufs.sh https://avatars.githubusercontent.com https://images.unsplash.com https://cdn.jsdelivr.net;"
      : "default-src 'self'; script-src 'none'; img-src 'self' data: http://localhost:3000 https://lh3.googleusercontent.com https://avatar.vercel.sh https://ufs.sh https://*.ufs.sh https://avatars.githubusercontent.com https://images.unsplash.com https://cdn.jsdelivr.net;",
  },

  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
    reactRemoveProperties: isProd ? { properties: ['^data-testid$'] } : false,
  },

  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      '@radix-ui/react-icons',
      'react-icons',
      '@tabler/icons-react',
      'framer-motion',
      '@headlessui/react',
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
      '@tanstack/react-query',
      '@tanstack/react-table',
      '@trpc/client',
      '@trpc/server',
      '@trpc/react-query',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'date-fns',
      'lodash',
      'clsx',
      'class-variance-authority',
      'recharts',
      'react-markdown',
      'remark',
      'rehype',
      'ai',
      'next-intl',
    ],
    memoryBasedWorkersCount: true,
    serverMinification: isProd,
    ppr: false,
  },

  // Moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: ['@prisma/client'],

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          trpc: {
            test: /[\\/]node_modules[\\/]@trpc[\\/]/,
            name: 'trpc',
            chunks: 'all',
            priority: 20,
          },
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'prisma',
            chunks: 'all',
            priority: 20,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
            priority: 15,
          },
        },
      }
    }

    if (isServer) {
      config.externals.push('@prisma/client')
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
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

  async redirects() {
    return []
  },
}

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts')

export default withBundleAnalyzer(withSimpleAnalytics(withNextIntl(nextConfig)))
