/* eslint-disable @typescript-eslint/no-explicit-any */

import { experimental_generateImage, type FileUIPart, tool } from 'ai'
import OpenAI, { toFile } from 'openai'
import { z } from 'zod'

import { uploadFile } from '@/lib/blob'
import { DEFAULT_IMAGE_MODEL } from '@/lib/chat/all-models'
import { getImageModel } from '@/lib/chat/providers'

import { getExaClient } from './exa'

interface GenerateImageProps {
	attachments?: Array<FileUIPart>
	lastGeneratedImage?: { imageUrl: string; name: string } | null
}

const openaiClient = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export const generateImage = ({
	attachments = [],
	lastGeneratedImage = null,
}: GenerateImageProps = {}) =>
	tool({
		description: `Generate images from text descriptions. Can optionally use attached images as reference.

Usage:
- Create images, artwork, illustrations from descriptive prompts
- Generate visual content based on user requests
- Support various art styles and subjects
- Be as detailed as possible in the description
- Use attached images as visual reference when available`,
		inputSchema: z.object({
			prompt: z
				.string()
				.describe(
					'Detailed description of the image to generate. Include style, composition, colors, mood, and any other relevant details.',
				),
		}),
		execute: async ({ prompt }) => {
			// Filter only image file parts for reference
			const imageParts = attachments.filter(
				part => part.type === 'file' && part.mediaType?.startsWith('image/'),
			)

			const hasLastGeneratedImage = lastGeneratedImage !== null
			const isEdit = imageParts.length > 0 || hasLastGeneratedImage
			console.log('CAlling generateImageTool with isEdit', isEdit)
			if (isEdit) {
				console.log(
					'Using OpenAI edit mode with images:',
					`lastGenerated: ${hasLastGeneratedImage ? 1 : 0}, attachments: ${imageParts.length}`,
				)

				// Convert parts and lastGeneratedImage to the format expected by OpenAI
				const inputImages = []

				// Add lastGeneratedImage first if it exists
				if (lastGeneratedImage) {
					const response = await fetch(lastGeneratedImage.imageUrl)
					const arrayBuffer = await response.arrayBuffer()
					const buffer = Buffer.from(arrayBuffer)
					const lastGenImage = await toFile(buffer, lastGeneratedImage.name, {
						type: 'image/png',
					})
					inputImages.push(lastGenImage)
				}

				// Add user file parts
				const partImages = await Promise.all(
					imageParts.map(async part => {
						const response = await fetch(part.url)
						const arrayBuffer = await response.arrayBuffer()
						const buffer = Buffer.from(arrayBuffer)

						// Use toFile to create the proper format for OpenAI
						return await toFile(buffer, part.filename || 'image.png', {
							type: part.mediaType || 'image/png',
						})
					}),
				)

				inputImages.push(...partImages)

				const rsp = await openaiClient.images.edit({
					model: 'gpt-image-1',
					image: inputImages, // Pass all images to OpenAI
					prompt,
				})

				// Convert base64 to buffer and upload to blob storage
				const buffer = Buffer.from(rsp.data?.[0]?.b64_json || '', 'base64')
				const timestamp = Date.now()
				const filename = `generated-image-${timestamp}.png`

				const result = await uploadFile(filename, buffer)

				return {
					imageUrl: result.url,
					prompt,
				}
			}

			// Non-edit case: use experimental_generateImage
			const res = await experimental_generateImage({
				model: getImageModel(DEFAULT_IMAGE_MODEL),
				prompt,
				n: 1,
				providerOptions: {
					telemetry: { isEnabled: true },
				},
			})

			console.log('res', res)

			// Convert base64 to buffer and upload to blob storage
			const base64Image = res.images?.[0]

			if (typeof base64Image !== 'string') {
				throw new Error('Image data is missing or not a string.')
			}

			const buffer = Buffer.from(base64Image, 'base64')
			const timestamp = Date.now()
			const filename = `generated-image-${timestamp}.png`

			const result = await uploadFile(filename, buffer)

			return {
				imageUrl: result.url,
				prompt,
			}
		},
	}) // Define types explicitly to help TS match the overload

// Define schema properly
const webSearchInputSchema = z.object({
	query: z.string().min(1).max(400).describe('The search query'),
})

export const webSearchTool = tool({
	name: 'webSearchTool',
	description: 'Search the live web and return up-to-date information.',
	inputSchema: webSearchInputSchema,
	execute: async ({ query }) => {
		const exa = getExaClient()

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

		// Replace `any` with a strict type
		type SearchResult = {
			title: string
			url: string
			content: string
			publishedDate?: string | null
		}

		return results.map(
			(result): SearchResult => ({
				title: result.title ?? '',
				url: result.url,
				content: result.summary,
				publishedDate: result.publishedDate ?? null,
			}),
		)
	},
})

// export const getWeatherTool = tool({
// 	description: 'Get current weather and 5-day forecast for a location',
// 	parameters: z.object({
// 		location: z.string().min(1).max(100).describe('The location to get weather for'),
// 	}),
// 	// 👇 fix: explicitly type the input to match zod schema
// 	execute: async ({ location }: { location: string }) => {
// 		const API_KEY = process.env.WEATHER_API_KEY
// 		if (!API_KEY) {
// 			throw new Error('OpenWeather API key not configured')
// 		}
// 		try {
// 			const response = await fetch(
// 				`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
// 					location,
// 				)}&appid=${API_KEY}&units=metric`,
// 			)

// 			if (!response.ok) {
// 				const message =
// 					response.status === 404
// 						? `Location "${location}" not found. Please check the spelling and try again.`
// 						: `Weather API error: ${response.status}`
// 				return {
// 					location,
// 					error: true,
// 					message,
// 					country: null,
// 					current: null,
// 					forecast: [],
// 				}
// 			}

// 			const data = await response.json()
// 			const current = data.list[0]

// 			const dailyForecast = data.list
// 				.filter((_: unknown, index: number) => index % 8 === 0)
// 				.slice(0, 5)
// 				.map((day: any) => {
// 					const date = new Date(day.dt * 1000)
// 					const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
// 					return {
// 						name: dayName,
// 						temp: Math.round(day.main.temp),
// 						condition: day.weather[0]?.main ?? 'Unknown',
// 						dayIndex: date.getDay(),
// 					}
// 				})

// 			return {
// 				location: data.city.name,
// 				country: data.city.country,
// 				current: {
// 					temp: Math.round(current.main.temp),
// 					condition: current.weather[0].main,
// 					description: current.weather[0].description,
// 					humidity: current.main.humidity,
// 					windSpeed: current.wind.speed,
// 				},
// 				forecast: dailyForecast,
// 				error: false,
// 				message: null,
// 			}
// 		} catch (error) {
// 			console.error('Weather fetch error:', error)
// 			return {
// 				location,
// 				error: true,
// 				message: 'Unable to fetch weather data. Please try again later.',
// 				country: null,
// 				current: null,
// 				forecast: [],
// 			}
// 		}
// 	},
// })
