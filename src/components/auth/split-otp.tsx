import { OTPInput, type OTPInputProps, type SlotProps } from 'input-otp'

import { cn } from '@/lib/utils'

const Slot = (props: SlotProps) => {
	return (
		<div
			className={cn(
				'flex size-9 items-center justify-center rounded-md border border-input bg-background font-semibold text-foreground shadow-xs transition-all',
				{
					'z-10 border-[1.6px] border-blue-600/40 ring-[3px] ring-blue-600/15': props.isActive,
				},
			)}
		>
			{props.char !== null && <div>{props.char}</div>}
		</div>
	)
}

export const SplitOTP = (props: OTPInputProps) => {
	return (
		// @ts-expect-error Just a simple type error
		<OTPInput
			{...props}
			containerClassName="flex items-center gap-3 has-disabled:opacity-50"
			maxLength={6}
			render={({ slots }) => (
				<div className="flex gap-2">
					{slots.map(slot => (
						<Slot
							key={slot.char}
							{...slot}
						/>
					))}
				</div>
			)}
		/>
	)
}
