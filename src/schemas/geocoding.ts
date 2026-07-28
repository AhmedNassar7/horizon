import { z } from 'zod'

export const geocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number().optional(),
  timezone: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  population: z.number().optional(),
})

export const openMeteoGeocodingSchema = z.object({
  results: z.array(geocodingResultSchema).optional(),
})

export type GeocodingResult = z.infer<typeof geocodingResultSchema>

/** Provider-agnostic shape used throughout the UI. */
export interface CityResult {
  id: string
  name: string
  country: string | null
  admin1: string | null
  latitude: number
  longitude: number
  population: number | null
}
