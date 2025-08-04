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
	images: {
		unoptimized: true,
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
		formats: ['image/avif', 'image/webp'],
	},
	experimental: {
		typedRoutes: true,
		reactCompiler: false,
		// Optimize package imports for better performance
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
		],
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
	output: 'standalone',
	reactStrictMode: true,
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
