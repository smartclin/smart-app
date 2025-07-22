import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Smart Pediatric Clinic',
		short_name: 'Smart Clinic',
		description: 'Modern pediatric clinic management and patient care app',
		start_url: '/',
		display: 'standalone',
		background_color: '#e0f7fa', // light, pleasant background for pediatric theme
		theme_color: '#0288d1',
		icons: [
			{
				src: '/favicon/web-app-manifest-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/favicon/web-app-manifest-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
	}
}
