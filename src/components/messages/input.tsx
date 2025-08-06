import { ArrowUp } from 'lucide-react'

import { Input as ShadcnInput } from '../ui/input'

interface InputProps {
	input: string
	handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
	isLoading: boolean
	status: string
	stop: () => void
}

export const Input = ({ input, handleInputChange, isLoading, status, stop }: InputProps) => {
	return (
		<div className="relative w-full">
			<ShadcnInput
				autoFocus
				className="w-full rounded-xl bg-secondary py-6 pr-12"
				onChange={handleInputChange}
				placeholder={'Say something...'}
				value={input}
			/>
			{status === 'streaming' || status === 'submitted' ? (
				<button
					className="-translate-y-1/2 absolute top-1/2 right-2 cursor-pointer rounded-full bg-black p-2 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
					onClick={stop}
					type="button"
				>
					<div className="h-4 w-4 animate-spin">
						<svg
							className="h-4 w-4 text-white"
							viewBox="0 0 24 24"
						>
							<title>Path</title>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								fill="none"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								fill="currentColor"
							/>
						</svg>
					</div>
				</button>
			) : (
				<button
					className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-black p-2 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
					disabled={isLoading || !input.trim()}
					type="submit"
				>
					<ArrowUp className="h-4 w-4 text-white" />
				</button>
			)}
		</div>
	)
}
