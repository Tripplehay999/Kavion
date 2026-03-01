/**
 * Extracts a user-friendly error message from a server action error.
 * In Next.js production builds, thrown server action errors have their
 * messages redacted and replaced with a generic string. This helper
 * intercepts that and returns a clean fallback instead.
 */
export function actionError(e: unknown, fallback = 'Something went wrong — please try again.'): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (!msg || msg.startsWith('An error occurred in the Server') || msg.includes('server-side exception')) {
    return fallback
  }
  return msg
}
