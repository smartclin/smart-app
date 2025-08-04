import type { AnthropicProviderOptions } from '@ai-sdk/anthropic'
import { gateway } from '@ai-sdk/gateway'
import type { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { type OpenAIResponsesProviderOptions, openai } from '@ai-sdk/openai'
import { extractReasoningMiddleware, wrapLanguageModel } from 'ai'

import { getModelAndProvider } from '../../providers/utils'
import { getImageModelDefinition, getModelDefinition } from './all-models'
import type { ImageModelId, ModelId } from './model-id'

export const getLanguageModel = (modelId: ModelId) => {
	const model = getModelDefinition(modelId)
	const languageProvider = gateway(model.id)

	// Wrap with reasoning middleware if the model supports reasoning
	if (model.features?.reasoning && model.owned_by === 'xai') {
		console.log('Wrapping reasoning middleware for', model.id)
		return wrapLanguageModel({
			model: languageProvider,
			middleware: extractReasoningMiddleware({ tagName: 'think' }),
		})
	}

	return languageProvider
}

export const getImageModel = (modelId: ImageModelId) => {
	const model = getImageModelDefinition(modelId)
	const { model: modelIdShort } = getModelAndProvider(modelId)

	if (model.owned_by === 'openai') {
		return openai.image(modelIdShort)
	}
	throw new Error(`Provider ${model.owned_by} not supported`)
}

export const getModelProviderOptions = (
	providerModelId: ModelId,
):
	| {
			openai: OpenAIResponsesProviderOptions
	  }
	| {
			anthropic: AnthropicProviderOptions
	  }
	| {
			xai: Record<string, never>
	  }
	| {
			google: GoogleGenerativeAIProviderOptions
	  }
	| Record<string, never> => {
	const model = getModelDefinition(providerModelId)
	if (model.owned_by === 'openai') {
		if (
			model.id === 'openai/o4-mini' ||
			model.id === 'openai/o3' ||
			model.id === 'openai/o3-mini'
		) {
			return {
				openai: {
					reasoningSummary: 'auto',
				} satisfies OpenAIResponsesProviderOptions,
			}
		}
		return { openai: {} }
	}
	if (model.owned_by === 'anthropic') {
		if (model.features?.reasoning) {
			return {
				anthropic: {
					thinking: {
						type: 'enabled',
						budgetTokens: 4096,
					},
				} satisfies AnthropicProviderOptions,
			}
		}
		return { anthropic: {} }
	}
	if (model.owned_by === 'xai') {
		return {
			xai: {},
		}
	}
	if (model.owned_by === 'google') {
		if (model.features?.reasoning) {
			return {
				google: {
					thinkingConfig: {
						thinkingBudget: 10000,
					},
				},
			}
		}
		return { google: {} }
	}
	return {}
}
