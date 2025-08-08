/**
 * Returns the base url of the website.
 *
 * This is applicable only for VERCEL and LOCAL DEVELOPMENT
 *
 * @returns {string}
 */
export default function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}
