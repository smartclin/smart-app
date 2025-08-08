// src/hooks/use-calendar-state.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';

// Define the possible calendar views
export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

interface CalendarState {
  currentDate: Date; // The currently selected or focused date
  view: CalendarView; // The current calendar view (day, week, month, agenda)
  setCurrentDate: (date: Date) => void; // This still takes a DATE
  setView: (view: CalendarView) => void;
  goToNext: () => void; // Function to navigate to next day/week/month
  goToPrevious: () => void; // Function to navigate to previous day/week/month
  goToToday: () => void; // Function to navigate to today's date
  isWeekView: boolean;
  isDayView: boolean;
}

/**
 * A custom hook to manage the state of a calendar component.
 * Provides functions for date navigation and view changes.
 */
export function useCalendarState(
  initialDate?: Date,
  initialView: CalendarView = 'month'
): CalendarState {
  // currentDate and its actual setter from useState
  const [currentDate, _setCurrentDate] = useState<Date>(initialDate || new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  // Helper to normalize date to start of the day to avoid time component issues
  const normalizeDate = useCallback((date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // This wrapper takes a Date and sets the normalized date
  const setCurrentDate = useCallback(
    (date: Date) => {
      _setCurrentDate(normalizeDate(date));
    },
    [normalizeDate]
  );

  // Navigation functions based on current view
  const goToNext = useCallback(() => {
    // *** FIX IS HERE: Call _setCurrentDate directly with the functional update ***
    _setCurrentDate(prevDate => {
      // `prevDate` is correctly typed as `Date` by TypeScript here
      const newDate = new Date(prevDate);
      switch (view) {
        case 'day':
        case 'agenda':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
      }
      return normalizeDate(newDate); // Ensure the new date is normalized before updating state
    });
  }, [view, normalizeDate]); // Dependencies for useCallback

  const goToPrevious = useCallback(() => {
    // *** FIX IS HERE: Call _setCurrentDate directly with the functional update ***
    _setCurrentDate(prevDate => {
      // `prevDate` is correctly typed as `Date` by TypeScript here
      const newDate = new Date(prevDate);
      switch (view) {
        case 'day':
        case 'agenda':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
      }
      return normalizeDate(newDate); // Ensure the new date is normalized before updating state
    });
  }, [view, normalizeDate]); // Dependencies for useCallback

  const goToToday = useCallback(() => {
    setCurrentDate(new Date()); // This uses our custom `setCurrentDate` which then calls `_setCurrentDate`
  }, [setCurrentDate]); // Dependency for useCallback

  const isWeekView = useMemo(() => view === 'week', [view]);
  const isDayView = useMemo(() => view === 'day' || view === 'agenda', [view]);

  return {
    currentDate,
    view,
    setCurrentDate, // We expose this custom setter for external use
    setView,
    goToNext,
    goToPrevious,
    goToToday,
    isWeekView,
    isDayView
  };
}
