import { ArrowUp } from 'lucide-react'
import type React from 'react' // Make sure React is imported for ChangeEvent

import type { modelID } from '@/ai/providers'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'

import { ModelPicker } from './model-picker'

// Correct the type for handleInputChange to expect HTMLTextAreaElement
interface InputProps {
  input: string
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void // FIX 1: Changed HTMLInputElement to HTMLTextAreaElement
  isLoading: boolean
  status: string
  stop: () => void
  selectedModel: modelID
  setSelectedModel: (model: modelID) => void
}

export const Textarea = ({
  input,
  handleInputChange, // This prop now has the correct type
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
}: InputProps) => {
  // Removed the standalone handleInputChange and setInput from here
  // These should be managed in the parent component that uses <Textarea />

  return (
    <div className='relative w-full pt-4'>
      <ShadcnTextarea
        autoFocus
        className='w-full resize-none rounded-2xl bg-secondary pt-4 pr-12 pb-16'
        onChange={handleInputChange} // This is now correctly typed
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (input.trim() && !isLoading) {
              // @ts-expect-error err - You might want to refine this type check
              // for 'closest' if you consistently get this error.
              // e.g., const form = (e.target as HTMLElement).closest('form');
              const form = e.target.closest('form')
              if (form) form.requestSubmit()
            }
          }
        }}
        placeholder={'Say something...'}
        value={input}
      />
      <ModelPicker
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {status === 'streaming' || status === 'submitted' ? (
        <button
          className='absolute right-2 bottom-2 cursor-pointer rounded-full bg-black p-2 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300'
          onClick={stop}
          type='button'
        >
          <div className='h-4 w-4 animate-spin'>
            <svg
              className='h-4 w-4 text-white'
              viewBox='0 0 24 24'
            >
              <title>Path</title>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                fill='none'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                fill='currentColor'
              />
            </svg>
          </div>
        </button>
      ) : (
        <button
          className='absolute right-2 bottom-2 rounded-full bg-black p-2 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:dark:bg-zinc-700 dark:disabled:opacity-80'
          disabled={isLoading || !input.trim()}
          type='submit' // Ensure this button is inside a <form> if it's type="submit"
        >
          <ArrowUp className='h-4 w-4 text-white' />
        </button>
      )}
    </div>
  )
}

// Removed the problematic `function setInput(value: string)` from here.
// This function must be part of a useState hook in the parent component.
