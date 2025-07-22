'use client'

import { useEffect, useRef, useState } from 'react'

import { Calendar } from '@/components/ui/calendar'
import { useCalendarState } from '@/hooks/use-calendar-state'
import { cn } from '@/lib/utils'

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
		setCurrentDate(date)
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
			animate
			className={cn('w-full px-0 [&_[role=gridcell]]:w-[33px]')}
			dayButtonClassName="hover:bg-sidebar-foreground/10 dark:hover:bg-sidebar-foreground/15"
			fixedWeeks
			mode="single"
			month={displayedMonth}
			navClassName="[&>button]:z-10"
			onMonthChange={setDisplayedMonth}
			onSelect={handleSelect}
			outsideClassName="aria-selected:opacity-100 aria-selected:bg-transparent"
			required
			selected={displayedDate}
			selectedClassName={cn(
				'[&>button]:bg-transparent [&>button]:text-sidebar-foreground',
				'[&>button:hover]:bg-sidebar-primary/80 [&>button:hover]:text-sidebar-primary-foreground',
				'[&>button:focus]:bg-sidebar-primary [&>button:focus]:text-sidebar-primary-foreground',
				isDayView && '[&>button]:bg-sidebar-foreground/4 dark:[&>button]:bg-sidebar-foreground/8',
			)}
			todayClassName={cn(
				'[&>button]:!bg-sidebar-primary [&>button]:!text-sidebar-primary-foreground',
				'[&>button:hover]:!bg-sidebar-primary [&>button:hover]:brightness-90',
				'[&>button]:font-medium',
			)}
			weekClassName={cn(
				"before:-z-10 relative z-0 before:absolute before:inset-0 before:rounded-md before:content-['']",
				'[&:has([aria-selected=true])]:before:bg-sidebar-foreground/4',
				'dark:[&:has([aria-selected=true])]:before:bg-sidebar-foreground/8',
				!isWeekView && 'before:hidden',
			)}
			weekdayClassName="flex-1 text-sidebar-foreground/70 font-medium"
		/>
	)
}
