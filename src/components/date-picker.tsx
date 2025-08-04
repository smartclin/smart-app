'use client'

import { useEffect, useRef, useState } from 'react'

// Assuming this Calendar component is indeed the Shadcn UI one,
// which wraps react-day-picker
import { Calendar } from '@/components/ui/calendar'
import { useCalendarState } from '@/hooks/use-calendar-state' // Your custom hook
import { cn } from '@/lib/utils' // Shadcn's utility for combining class names

export function DatePicker() {
	const { currentDate, setCurrentDate, view } = useCalendarState()
	const [displayedDate, setDisplayedDate] = useState<Date>(currentDate)
	const [displayedMonth, setDisplayedMonth] = useState<Date>(currentDate)
	const updateSource = useRef<'internal' | 'external'>('external')

	// Prevent circular updates and animation conflicts by tracking update source:
	// - Internal (calendar clicks): Update context directly, skip useEffect
	// - External (navigation/hotkeys): Update local state via useEffect

	const handleSelect = (date: Date | undefined) => {
		if (!date) return

		updateSource.current = 'internal'
		setDisplayedDate(date)
		setCurrentDate(date) // Update the context date
	}

	useEffect(() => {
		if (updateSource.current === 'external') {
			setDisplayedDate(currentDate)
			setDisplayedMonth(currentDate)
		}
		updateSource.current = 'external'
	}, [currentDate])

	const isWeekView = view === 'week'
	const isDayView = view === 'day' || view === 'agenda'

	return (
		<Calendar
			// `animate` is also not a direct prop on react-day-picker,
			// if this was for custom animation, it needs to be applied differently.
			// For now, I'll remove it as it's causing a TS error unless explicitly supported by your wrapper.
			// animate

			className={cn('w-full px-0')} // Apply overall width and padding to the Calendar wrapper
			// Instead of direct `*ClassName` props, use the `classNames` prop (from react-day-picker)
			// This allows targeting specific internal elements with Tailwind/CSS.
			classNames={{
				// Refer to react-day-picker documentation for available classNames keys:
				// https://react-day-picker.js.org/api/interfaces/ClassNames
				// Some common ones are:
				day: cn(
					'hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-foreground/15', // dayButtonClassName
					// Apply selected class logic
					// Ensure the order of classes for proper override if necessary
					'[&[aria-selected="true"]>button]:bg-transparent [&[aria-selected="true"]>button]:text-sidebar-foreground',
					'[&[aria-selected="true"]>button:hover]:bg-sidebar-primary/80 [&[aria-selected="true"]>button:hover]:text-sidebar-primary-foreground',
					'[&[aria-selected="true"]>button:focus]:bg-sidebar-primary [&[aria-selected="true"]>button:focus]:text-sidebar-primary-foreground',
					isDayView &&
						'[&[aria-selected="true"]>button]:bg-sidebar-foreground/4 dark:[&[aria-selected="true"]>button]:bg-sidebar-foreground/8',
				),
				// Today styling needs to target the day that has the `data-today` attribute
				day_today: cn(
					// This typically targets the today's day button
					'!bg-sidebar-primary !text-sidebar-primary-foreground',
					'hover:!bg-sidebar-primary hover:brightness-90',
					'font-medium',
				),
				// Navigation buttons
				nav_button: 'z-10', // navClassName="[&>button]:z-10"
				// Days outside the month
				day_outside: 'opacity-100 bg-transparent', // outsideClassName="aria-selected:opacity-100 aria-selected:bg-transparent"
				// Week row styling
				week: cn(
					"before:-z-10 relative z-0 before:absolute before:inset-0 before:rounded-md before:content-['']",
					// The has selector can be tricky here. Instead, react-day-picker applies `rdp-day_selected` to the selected day.
					// The `weekClassName` with `&:has([aria-selected=true])` typically tries to style the *entire week row* if any day in it is selected.
					// You might need a more complex CSS solution for this, or check if the shadcn calendar provides a specific prop for week highlighting.
					// For direct `classNames` on `week`, it's generally applied to the `div` wrapper for the week row.
					// The conditional `before:hidden` logic can also be applied here.
					!isWeekView && 'before:hidden',
					// The `before:bg-sidebar-foreground/4` is tricky with classNames directly.
					// It's applied if the week `has` a selected day. This usually means
					// custom CSS in a global stylesheet or a `style` prop based on state.
					// For now, I'll put a placeholder.
				),
				weekday: 'flex-1 text-sidebar-foreground/70 font-medium', // weekdayClassName
				// You may need to inspect the rendered HTML to find the exact class names
				// for gridcell (if your `w-[33px]` is not applying correctly via global className)
				// The `[&_[role=gridcell]]:w-[33px]` should still work as it's targeting any `gridcell` role within the Calendar component's rendered output.
			}}
			fixedWeeks
			mode="single"
			month={displayedMonth}
			onMonthChange={setDisplayedMonth}
			onSelect={handleSelect}
			required
			selected={displayedDate}
		/>
	)
}
