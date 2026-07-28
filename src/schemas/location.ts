import { z } from 'zod'

/**
 * BigDataCloud's reverse-geocode-client response has 100+ optional fields
 * depending on locality data available for a given point. We only assert
 * the shape of the fields we actually use and let everything else pass
 * through untouched.
 */
export const bigDataCloudLocationSchema = z
  .object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional(),
    locality: z.string().optional(),
    principalSubdivision: z.string().optional(),
    countryName: z.string().optional(),
    countryCode: z.string().optional(),
  })
  .loose()

export type BigDataCloudLocationResponse = z.infer<typeof bigDataCloudLocationSchema>

export interface ResolvedLocation {
  latitude: number
  longitude: number
  label: string
  region: string | null
  country: string | null
  countryCode: string | null
}
