import { z } from 'zod'

export const openMeteoAirQualitySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current: z.object({
    time: z.string(),
    pm2_5: z.number().nullable(),
    pm10: z.number().nullable(),
    us_aqi: z.number().nullable(),
    european_aqi: z.number().nullable(),
  }),
})

export type OpenMeteoAirQualityResponse = z.infer<typeof openMeteoAirQualitySchema>

export interface AirQuality {
  time: string
  pm2_5: number | null
  pm10: number | null
  usAqi: number | null
  europeanAqi: number | null
}
