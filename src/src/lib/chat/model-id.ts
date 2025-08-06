import type { GatewayModelId } from '@ai-sdk/gateway'
import type { OpenAIProvider } from '@ai-sdk/openai'

// Exclude the non-literal model ids
type GatewayLiteralModelId = GatewayModelId extends infer T
	? T extends string
		? string extends T
			? never
			: T
		: never
	: never

// Adds models available in gateway but not yet in the gateway package
export type ModelId = GatewayLiteralModelId | 'alibaba/qwen3-coder'

type OpenAIimageModelId = Parameters<OpenAIProvider['imageModel']>[0]

// Exclude the non-literal model ids
type OpenAILiteralImageModelId = OpenAIimageModelId extends infer T
	? T extends string
		? string extends T
			? never
			: T
		: never
	: never

export type ImageModelId = `openai/${OpenAILiteralImageModelId}`
