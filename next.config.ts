import initializeBundleAnalyzer from '@next/bundle-analyzer'
import withSimpleAnalytics from '@simpleanalytics/next/plugin'
import type { NextConfig } from 'next'

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
	enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
})

const isProd = process.env.NODE_ENV === 'production'
const internalHost = 'localhost'

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	// Performance: Enable image optimization
	images: {
		unoptimized: false, // Enable optimization for better performance
		remotePatterns: [
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
				hostname: '*.ufs.sh',
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
		// Optimize image formats for better performance
		formats: ['image/avif', 'image/webp'],
		// Performance: Add image sizing for better CLS
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// Performance: Optimize image loading
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	// Performance optimizations
	compiler: {
		// Remove console logs in production
		removeConsole: isProd ? { exclude: ['error'] } : false,
	},
	poweredByHeader: false,
	generateEtags: true,
	compress: true,
	experimental: {
		// Performance: Enable React Compiler for better optimization
		reactCompiler: isProd,
		// Performance: Enable optimizations
		optimizeCss: isProd,
		optimizeServerReact: isProd,
		// Performance: Enable Turbo for faster builds
		turbo: {
			resolveAlias: {
				'@': './src',
				'~': './public',
			},
		},
		// Performance: Optimize package imports for better tree shaking
		optimizePackageImports: [
			'lucide-react',
			'@heroicons/react',
			'@radix-ui/react-icons',
			'react-icons',
			'framer-motion',
			'@headlessui/react',
			'@tailwindcss/postcss',
			'date-fns',
			'@tabler/icons-react',
			'lodash',
			'recharts',
			// Add more packages from your dependencies
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

		// Performance: Enable memory optimizations
		memoryBasedWorkersCount: true,
		// Performance: Improved caching
		serverMinification: true,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
	output: 'standalone',
	reactStrictMode: true,
	// Performance: Enable swcMinify for faster builds
	swcMinify: true,
	webpack(config) {
		// Grab the existing rule that handles SVG imports
		// @ts-expect-error any
		const fileLoaderRule = config.module.rules.find(rule => rule.test?.test?.('.svg'))

		config.module.rules.push(
			// Reapply the existing rule, but only for svg imports ending in ?url
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			// Convert all other *.svg imports to React components
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
				use: ['@svgr/webpack'],
			},
		)

		// Modify the file loader rule to ignore *.svg, since we have it handled now.
		fileLoaderRule.exclude = /\.svg$/i

		// Performance: Enable caching
		config.cache = true

		return config
	},
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
}

const withSimpleAnalyticsNext = withSimpleAnalytics(nextConfig)
export default withBundleAnalyzer(withSimpleAnalyticsNext)
