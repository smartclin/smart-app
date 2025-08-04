import type { FileUIPart, ModelMessage } from 'ai'
import type { Session } from 'next-auth'

import type { ModelId } from '@/lib/ai/model-id'
import { codeInterpreter } from '@/lib/ai/tools/code-interpreter'
import { createDocument } from '@/lib/ai/tools/create-document'
import { deepResearch } from '@/lib/ai/tools/deep-research/tool'
import { generateImage } from '@/lib/ai/tools/generate-image'
import { getWeather } from '@/lib/ai/tools/get-weather'
import { readDocument } from '@/lib/ai/tools/read-document'
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions'
import { retrieve } from '@/lib/ai/tools/retrieve'
import { stockChart } from '@/lib/ai/tools/stock-chart'
import { updateDocument } from '@/lib/ai/tools/update-document'
import { webSearch } from '@/lib/ai/tools/web-search'

import type { StreamWriter } from '../types'

export function getTools({
	dataStream,
	session,
	contextForLLM,
	messageId,
	selectedModel,
	attachments = [],
	lastGeneratedImage = null,
}: {
	dataStream: StreamWriter
	session: Session
	contextForLLM?: ModelMessage[]
	messageId: string
	selectedModel: ModelId
	attachments: Array<FileUIPart>
	lastGeneratedImage: { imageUrl: string; name: string } | null
}) {
	return {
		getWeather,
		createDocument: createDocument({
			session,
			dataStream,
			contextForLLM,
			messageId,
			selectedModel,
		}),
		updateDocument: updateDocument({
			session,
			dataStream,
			messageId,
			selectedModel,
		}),
		requestSuggestions: requestSuggestions({
			session,
			dataStream,
		}),
		readDocument: readDocument({
			session,
			dataStream,
		}),
		// reasonSearch: createReasonSearch({
		//   session,
		//   dataStream,
		// }),
		retrieve,
		webSearch: webSearch({ session, dataStream }),
		stockChart,
		codeInterpreter,
		generateImage: generateImage({ attachments, lastGeneratedImage }),
		deepResearch: deepResearch({ session, dataStream, messageId }),
	}
}
