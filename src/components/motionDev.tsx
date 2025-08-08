// src/components/MotionDiv.tsx
'use client' // This is crucial to mark it as a client boundary

import { type MotionProps, motion } from 'framer-motion' // Import all necessary types and components here
import type React from 'react'

// This component directly wraps motion.div
interface MotionDivProps extends MotionProps {
  children: React.ReactNode
  className?: string // Add className if you use it often
}

export function MotionDiv({ children, ...props }: MotionDivProps) {
  return <motion.div {...props}>{children}</motion.div>
}

// You can create similar wrappers for other Framer Motion components if needed, e.g., motion.span
interface MotionSpanProps extends MotionProps {
  children: React.ReactNode
  className?: string
}

export function MotionSpan({ children, ...props }: MotionSpanProps) {
  return <motion.span {...props}>{children}</motion.span>
}

// Example for motion.h1 if you had one
interface MotionH1Props extends MotionProps {
  children: React.ReactNode
  className?: string
}

export function MotionH1({ children, ...props }: MotionH1Props) {
  return <motion.h1 {...props}>{children}</motion.h1>
}
