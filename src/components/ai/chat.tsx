'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { defaultModel, type modelID } from '@/ai/providers'

import { Header } from './header'
import { Messages } from './messages'
import { ProjectOverview } from './projectOverview'
import { Textarea } from './textarea'

export default function Chat() {
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel)
  const { sendMessage, messages, status, stop } = useChat({
    onError: (error) => {
      toast.error(
        error.message.length > 0
          ? error.message
          : 'An error occured, please try again later.',
        { position: 'top-center', richColors: true },
      )
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className='stretch flex h-dvh w-full flex-col justify-center'>
      <Header />
      {messages.length === 0 ? (
        <div className='mx-auto w-full max-w-xl'>
          <ProjectOverview />
        </div>
      ) : (
        <Messages
          isLoading={isLoading}
          messages={messages}
          status={status}
        />
      )}
      <form
        className='mx-auto w-full max-w-xl bg-white px-4 pb-8 sm:px-0 dark:bg-black'
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage({ text: input }, { body: { selectedModel } })
          setInput('')
        }}
      >
        <Textarea
          handleInputChange={(e) => setInput(e.currentTarget.value)}
          input={input}
          isLoading={isLoading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          status={status}
          stop={stop}
        />
      </form>
    </div>
  )
}
