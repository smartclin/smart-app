'use server'

import { cookies } from 'next/headers'
import z from 'zod'

export const ToolSchema = z.object({
	description: z.string().optional(),
	providerOptions: z.any().optional(), // or shape it properly
	// ... add more fields as per your Tool definition
})

export type Tool = z.infer<typeof ToolSchema>
export async function saveToolAsCookie(tool: Tool) {
	try {
		const cookieStore = await cookies()
		cookieStore.set('chat-tool', JSON.stringify(tool), {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
		})
	} catch (error) {
		console.error('Failed to save tool to cookie:', error)
	}
}

export async function getToolFromCookies(): Promise<Tool | null> {
	try {
		const cookieStore = await cookies()
		const toolString = cookieStore.get('chat-tool')?.value

		if (toolString) {
			const parsed = JSON.parse(toolString)

			if (isValidTool(parsed)) {
				return parsed
			}
		}
	} catch (error) {
		console.error('Failed to get tool from cookie:', error)
	}

	return null
}

// Use Zod if available
function isValidTool(obj: unknown): obj is Tool {
	return ToolSchema.safeParse(obj).success
}
