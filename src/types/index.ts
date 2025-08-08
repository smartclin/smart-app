// src/types/prisma-utils.ts (or a suitable location for shared types)

export * from './admin'
export * from './appointment'
export * from './data-types'
export * from './doctor'
export * from './helper'
export * from './patients'
export * from './payment'
export * from './query'
export * from './records'
export * from './staff'
export * from './vitals'
export interface SearchParamsProps {
  searchParams?: Promise<{ [key: string]: string | undefined }>
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

import type { inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '@/trpc/routers/_app'

export type ChatGetOneOutput = inferRouterOutputs<AppRouter>['chats']['getOne']
