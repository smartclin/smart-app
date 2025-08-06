import { google } from '@ai-sdk/google'
import { v4 as uuid } from '@lukeed/uuid'
import { generateText, tool } from 'ai'
import { GlobeIcon, Image, Lightbulb, Zap } from 'lucide-react'
import { UTApi, UTFile } from 'uploadthing/server'
import { z } from 'zod'

import type { ModelId } from '../model/model'
import { getExaClient } from './exa'

// === Generate Image Tool ===
export const generateImageTool = tool({
	description: 'Generate an AI image from a text prompt.',
	inputSchema: z.object({
		prompt: z.string().describe('The prompt to generate the image from.'),
	}),
	execute: async ({ prompt }) => {
		try {
			const result = await generateText({
				model: google('gemini-2.0-flash-preview-image-generation'),
				providerOptions: {
					google: { responseModalities: ['TEXT', 'IMAGE'] },
				},
				prompt,
			})

			let base64Image = ''

			for (const file of result.files) {
				if (file.mediaType.startsWith('image/')) {
					base64Image = file.base64
				}
			}

			if (!base64Image) {
				throw new Error('Generated image is empty or invalid.')
			}

			const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
			const buffer = Buffer.from(base64Data, 'base64')

			const file = new UTFile([buffer], 'generated-image.png', {
				customId: `ai-generated-image-${uuid()}`,
				type: 'image/png',
			})

			const utapi = new UTApi()
			const uploadedImage = await utapi.uploadFiles([file])

			const uploaded = uploadedImage?.[0]?.data
			if (!uploaded) throw new Error('Upload failed.')

			return {
				imageUrl: uploaded.ufsUrl,
				imageKey: uploaded.key,
				prompt,
			}
		} catch (error) {
			console.error('Image generation error:', error)
			throw new Error('Failed to generate image.')
		}
	},
})

// === Web Search Tool ===
export const webSearchTool = tool({
	description: 'Search the live web and return up-to-date information.',
	inputSchema: z.object({
		query: z.string().min(1).max(400).describe('The search query.'),
	}),
	execute: async ({ query }) => {
		const exa = getExaClient()

		try {
			const { results } = await exa.searchAndContents(query, {
				livecrawl: 'always',
				numResults: 2,
				summary: true,
			})

			if (!results || results.length === 0) {
				return [
					{
						title: 'No results found',
						url: '',
						content:
							'No recent information was found for this search query. This might be due to the search service being temporarily unavailable or the query being too specific.',
						publishedDate: null,
					},
				]
			}

			return results.map(r => ({
				title: r.title || 'Untitled',
				url: r.url || '',
				content: r.summary?.slice(0, 500) || 'No content available.',
				publishedDate: r.publishedDate || null,
			}))
		} catch (err) {
			console.error('Web search error:', err)
			return [
				{
					title: 'Search temporarily unavailable',
					url: '',
					content:
						'The web search service is currently experiencing issues. Please try again in a few moments.',
					publishedDate: null,
				},
			]
		}
	},
})

// === Weather Tool ===
export const getWeatherTool = tool({
	description: 'Get current weather and 5-day forecast for a location.',
	inputSchema: z.object({
		location: z.string().min(1).max(100).describe('The location to get weather for.'),
	}),
	execute: async ({ location }) => {
		const API_KEY = process.env.WEATHER_API_KEY
		if (!API_KEY) throw new Error('OpenWeather API key not configured.')

		try {
			const res = await fetch(
				`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric`,
			)

			if (!res.ok) {
				if (res.status === 404) {
					return {
						error: true,
						message: `Location "${location}" not found.`,
						location,
					}
				}
				throw new Error(`Weather API error: ${res.status}`)
			}

			const data = await res.json()
			const current = data.list[0] as WeatherDataEntry

			type WeatherDataEntry = {
				wind: {
					speed: number
				}
				city: {
					name: string
					country: string
				}
				dt: number
				main: {
					humidity: number
					temp: number
				}
				weather: {
					main: string
				}[]
			}

			const forecast = (data.list as WeatherDataEntry[])
				.filter((_, i) => i % 8 === 0)
				.slice(0, 5)
				.map(day => {
					const date = new Date(day.dt * 1000)
					return {
						name: date.toLocaleDateString('en-US', { weekday: 'short' }), // Fix: Add ':' after "short"
						temp: Math.round(day.main.temp),
						condition: day.weather[0]?.main ?? '',
						dayIndex: date.getDay(),
					}
				})

			return {
				location: data.city.name,
				country: data.city.country,
				current: {
					temp: Math.round(current.main.temp),
					condition: current.weather[0]?.main ?? '',
					description: current.weather[0]?.main ?? '',
					humidity: current.main?.humidity ?? 0,
					windSpeed: current.wind?.speed ?? 0,
				},
				forecast,
				error: false,
			}
		} catch (error) {
			console.error('Weather fetch error:', error)
			return {
				error: true,
				message: 'Unable to fetch weather data. Please try again later.',
				location,
			}
		}
	},
})

// === Tool Types ===
export type Tool = 'none' | 'image-gen' | 'web-search' | 'get-weather' | 'reasoning'

export const TOOL_REGISTRY = {
	'get-weather': {
		name: 'Get weather',
		tool: getWeatherTool,
		defaultModel: 'gemini-2.5-flash' as const,
		icon: Zap,
	},
	'web-search': {
		name: 'Search web',
		tool: webSearchTool,
		defaultModel: 'gemini-2.5-flash' as const,
		icon: GlobeIcon,
	},
	'image-gen': {
		name: 'Create image',
		tool: generateImageTool,
		defaultModel: 'gemini-2.5-flash' as const,
		icon: Image,
	},
	reasoning: {
		name: 'Think longer',
		tool: {}, // Placeholder
		defaultModel: 'qwen/qwen3-32b' as const,
		icon: Lightbulb,
	},
} as const

export function isValidTool(tool: string): tool is Tool {
	return ['none', 'image-gen', 'web-search', 'get-weather', 'reasoning'].includes(tool)
}

export function getTool(tool: Tool) {
	if (tool === 'none' || tool === 'reasoning') {
		return {}
	}
	return { [TOOL_REGISTRY[tool].name]: TOOL_REGISTRY[tool].tool } as const
}

export function getModelForTool(tool: Tool, fallbackModel: ModelId): ModelId {
	if (tool === 'none' || tool === 'reasoning') return fallbackModel
	return TOOL_REGISTRY[tool]?.defaultModel || fallbackModel
}
