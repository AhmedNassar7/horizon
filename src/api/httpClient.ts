import type { z } from 'zod'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Fetches JSON and validates it against a Zod schema at the boundary — we
 * never trust an external API's response to match our TypeScript types just
 * because we wrote a type for it. */
export async function fetchValidated<Schema extends z.ZodType>(
  url: string | URL,
  schema: Schema,
  init?: RequestInit,
): Promise<z.infer<Schema>> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (cause) {
    throw new ApiError(`Network request failed: ${String(cause)}`)
  }

  if (!response.ok) {
    throw new ApiError(
      `Request to ${new URL(url).hostname} failed (${response.status})`,
      response.status,
    )
  }

  const json: unknown = await response.json()
  const result = schema.safeParse(json)
  if (!result.success) {
    throw new ApiError(
      `Unexpected response shape from ${new URL(url).hostname}: ${result.error.message}`,
    )
  }
  return result.data
}
