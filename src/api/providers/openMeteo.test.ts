import { describe, expect, it } from 'vitest'
import { openMeteoProvider } from './openMeteo'

describe('openMeteoProvider.getWeather', () => {
  it('normalizes the raw Open-Meteo response into our domain model', async () => {
    const weather = await openMeteoProvider.getWeather(51.5, -0.11)

    expect(weather.timezone).toBe('Europe/London')
    expect(weather.current.temperatureC).toBe(21.4)
    expect(weather.current.isDay).toBe(true)
    expect(weather.hourly).toHaveLength(2)
    expect(weather.daily).toHaveLength(2)
    expect(weather.daily[0]).toMatchObject({ date: '2026-07-28', tempMaxC: 23.5 })
  })
})

describe('openMeteoProvider.getAirQuality', () => {
  it('normalizes the raw air quality response', async () => {
    const aqi = await openMeteoProvider.getAirQuality(51.5, -0.11)

    expect(aqi.usAqi).toBe(32)
    expect(aqi.europeanAqi).toBe(18)
  })
})
