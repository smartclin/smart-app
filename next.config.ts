import initializeBundleAnalyzer from '@next/bundle-analyzer';
import withSimpleAnalytics from '@simpleanalytics/next/plugin';
import type { NextConfig } from 'next';

// Initialize Bundle Analyzer conditionally
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
});

const isProd = process.env.NODE_ENV === 'production';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    // Top-level configurations
    eslint: {
        // Disabling ESLint during builds can be risky; only do this if you have a separate linting step.
        // For production, it's generally recommended to run linting as part of CI/CD.
        ignoreDuringBuilds: true,
    },
    // `output: 'standalone'` is great for Docker/containerized deployments,
    // as it creates a minimal, self-contained output.
    output: 'standalone',
    reactStrictMode: true, // Recommended for identifying potential problems in an application
    poweredByHeader: false, // Disables the "x-powered-by: Next.js" header for minor security obscurity
    generateEtags: true, // Enables ETag generation for better caching
    compress: true, // Enables Gzip compression for all responses

    // Image Optimization Configuration
    images: {
        unoptimized: false, // Ensures Next.js Image Optimization is active
        remotePatterns: [
            // Using a specific port for localhost is fine for dev, but in prod,
            // ensure your assets are served from a consistent, secure origin.
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'avatar.vercel.sh',
            },
            {
                protocol: 'https',
                hostname: 'ufs.sh',
            },
            {
                protocol: 'https',
                hostname: '*.ufs.sh', // Allows subdomains of ufs.sh
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        // Prioritize modern image formats for better performance and smaller file sizes.
        formats: ['image/avif', 'image/webp'],
        // Define device sizes to optimize image serving for various screen sizes,
        // improving LCP (Largest Contentful Paint) and CLS (Cumulative Layout Shift).
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        // Define image sizes for `srcset` generation.
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Caching for optimized images (in seconds). 60 is very short; consider increasing to 3600 (1 hour) or more.
        minimumCacheTTL: 60, // Consider 3600 (1 hour) or 86400 (1 day) in production
        dangerouslyAllowSVG: true, // Use with caution. SVGs can contain scripts.
        contentDispositionType: 'attachment', // `inline` is more common for images
        // Strong Content Security Policy for images. 'unsafe-inline' might be needed for some external SVG rendering.
        // If dangerouslyAllowSVG is true, consider making this more restrictive or specific.
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Compiler options (SWC)
    compiler: {
        // Removes console.log statements in production builds for cleaner code and minor performance gains.
        // `exclude: ['error']` is a good practice to keep error logs.
        removeConsole: isProd ? { exclude: ['error'] } : false,
    },

    // TypeScript Configuration
    // Set to `true` to fail builds on TypeScript errors in production.
    // Setting to `false` (ignoreBuildErrors) is generally discouraged for production.
    typescript: {
        ignoreBuildErrors: false,
    },

    // Asset Prefix for CDN integration (usually only for non-Vercel deployments)
    // `undefined` is correct for production unless you're serving static assets from a specific CDN.
    assetPrefix: isProd ? undefined : 'http://localhost:3000',

    // Experimental features for performance and build optimization
    experimental: {
        // Optimizes CSS delivery in production builds.
        optimizeCss: isProd,
        // Optimizes Server-side React rendering in production (new in Next.js 13+).
        optimizeServerReact: isProd,
        // Optimizes package imports for better tree-shaking and smaller bundle sizes,
        // especially beneficial for large icon libraries and UI component kits.
        optimizePackageImports: [
            'lucide-react',
            '@heroicons/react',
            '@radix-ui/react-icons',
            'react-icons',
            'framer-motion',
            '@headlessui/react',
            '@tailwindcss/postcss', // Not typically optimized for package imports, might be redundant here.
            'date-fns',
            '@tabler/icons-react',
            'lodash', // Lodash is highly tree-shakable already, ensure you're importing specific modules.
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
            'ai',
        ],
        // Enables memory-based workers for faster parallel builds (useful on machines with ample RAM).
        memoryBasedWorkersCount: true,
        // Further optimizes server-side bundles by minifying them.
        serverMinification: true,
        // Webpack 5 persistent caching is enabled by default in Next.js 12+,
        // so explicitly setting `config.cache = true` in `webpack` might be redundant but harmless.
        // It's good to be aware of the default behavior.
    },

    // Webpack Configuration
    webpack(config, { isServer }) {
        // SVG Handling: Configures how SVG files are imported.
        // It uses @svgr/webpack to convert SVGs into React components,
        // while allowing `?url` suffix to import SVGs as regular URLs (e.g., for `<img>` tags).

        // Find the existing rule for file-loader that handles SVGs
        // @ts-expect-error type-check for webpack rules can be complex
        const fileLoaderRule = config.module.rules.find(
            (rule) => rule.test && rule.test instanceof RegExp && rule.test.test('.svg')
        );

        // If the rule is found, modify it.
        if (fileLoaderRule) {
            // Exclude SVG files from the default file-loader rule
            // as we will handle them with SVGR.
            fileLoaderRule.exclude = /\.svg$/i;

            config.module.rules.push(
                // Rule to handle SVGs imported with `?url` (as asset URLs)
                {
                    ...fileLoaderRule, // Keep original file-loader settings
                    test: /\.svg$/i,
                    resourceQuery: /url/, // Only apply to SVG imports ending with `?url`
                    type: 'asset/resource', // Use Webpack 5's asset modules for direct URLs
                    generator: {
                        filename: 'static/media/[name].[hash][ext]', // Customize output path for assets
                    },
                },
                // Rule to handle SVGs imported as React components
                {
                    test: /\.svg$/i,
                    // Apply this rule only if not using `?url`
                    issuer: fileLoaderRule.issuer, // Apply only where JS/TS files are importing
                    resourceQuery: { not: [/url/] }, // Exclude if `?url` is present
                    use: ['@svgr/webpack'], // Use SVGR to convert SVG to React component
                }
            );
        }

        return config;
    },

    // Turbopack specific configuration (used with `next dev --turbo`)
    // This is distinct from Webpack and applies when using Turbopack.
    // Ensure this aligns with your Webpack SVG config if you use both dev modes.
    turbopack: {
        rules: {
            // For Turbopack, this directly tells it to use `@svgr/webpack` for SVG files.
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js', // Treat as JavaScript modules (React components)
            },
        },
    },
};

// Compose plugins: Simple Analytics first, then Bundle Analyzer.
// The order generally matters for how plugins process the config.
const withSimpleAnalyticsNext = withSimpleAnalytics(nextConfig);

// Export the final composed configuration
export default withBundleAnalyzer(withSimpleAnalyticsNext);
