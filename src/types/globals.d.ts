// src/types/cookie.ts or src/types/global.d.ts

// These types are part of your application's type definitions.
// You can export them if they are intended to be imported by other modules.
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path: string;
  expires?: number; // Unix timestamp in milliseconds
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export interface CookieInit {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number; // Unix timestamp in milliseconds
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface CookieChangeEvent extends Event {
  readonly changed: Cookie[];
  readonly deleted: Cookie[];
}

// Define the CookieStore interface (can be exported if you want to reuse its type elsewhere)
export interface CookieStore {
  get(name: string): Promise<Cookie | undefined>;
  set(options: CookieInit): Promise<void>;
  delete(name: string | CookieInit): Promise<void>;
  getAll(name?: string): Promise<Cookie[]>;

  // Specific event listener for 'change' events on the CookieStore
  addEventListener(
    type: 'change',
    listener: (this: CookieStore, ev: CookieChangeEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  // Overload for other generic event types if needed
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: 'change',
    listener: (this: CookieStore, ev: CookieChangeEvent) => void,
    options?: boolean | EventListenerOptions
  ): void;
  // Overload for other generic event types if needed
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

// Global Augmentation:
// Use 'declare global' to add properties to existing global interfaces.
// This is necessary if this file also contains 'export' statements,
// making it a module. Without 'declare global', these interfaces
// would be local to this module and not augment the browser's global types.
declare global {
  interface Window {
    cookieStore: CookieStore;
  }

  interface Navigator {
    cookieStore: CookieStore;
  }
}

// --- Regarding Next.js types (keep them separate or in next-env.d.ts) ---
import type { cookies } from 'next/headers';
type ReadonlyRequestCookies = ReturnType<typeof cookies> extends Promise<infer T> ? T : never;
export type { ReadonlyRequestCookies };
