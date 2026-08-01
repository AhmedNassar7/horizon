import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.open-meteo.com/v1/forecast', () =>
    HttpResponse.json({
      latitude: 51.5,
      longitude: -0.11,
      timezone: 'Europe/London',
      utc_offset_seconds: 0,
      current: {
        time: '2026-07-28T12:00',
        temperature_2m: 21.4,
        apparent_temperature: 20.9,
        relative_humidity_2m: 58,
        wind_speed_10m: 14.2,
        wind_direction_10m: 210,
        wind_gusts_10m: 22.5,
        weather_code: 2,
        surface_pressure: 1014.2,
        cloud_cover: 40,
        is_day: 1,
        precipitation: 0,
        visibility: 24140,
        uv_index: 4.2,
        dew_point_2m: 12.8,
      },
      hourly: {
        time: ['2026-07-28T12:00', '2026-07-28T13:00'],
        temperature_2m: [21.4, 22.1],
        precipitation_probability: [5, 10],
        weather_code: [2, 2],
        is_day: [1, 1],
        wind_speed_10m: [14.2, 15.8],
      },
      daily: {
        time: ['2026-07-28', '2026-07-29'],
        temperature_2m_max: [23.5, 24.1],
        temperature_2m_min: [14.2, 15.0],
        precipitation_probability_max: [10, 20],
        weather_code: [2, 61],
        sunrise: ['2026-07-28T05:12', '2026-07-29T05:13'],
        sunset: ['2026-07-28T21:02', '2026-07-29T21:01'],
        uv_index_max: [5.2, 4.8],
        wind_speed_10m_max: [18.4, 20.1],
        wind_gusts_10m_max: [28.0, 30.5],
      },
    }),
  ),

  http.get('https://air-quality-api.open-meteo.com/v1/air-quality', () =>
    HttpResponse.json({
      latitude: 51.5,
      longitude: -0.11,
      current: {
        time: '2026-07-28T12:00',
        pm2_5: 8.3,
        pm10: 14.1,
        us_aqi: 32,
        european_aqi: 18,
      },
    }),
  ),

  http.get('https://geocoding-api.open-meteo.com/v1/search', () =>
    HttpResponse.json({
      results: [
        {
          id: 2643743,
          name: 'London',
          latitude: 51.50853,
          longitude: -0.12574,
          elevation: 25,
          timezone: 'Europe/London',
          country: 'United Kingdom',
          country_code: 'GB',
          admin1: 'England',
          population: 8961989,
        },
      ],
    }),
  ),

  http.get('https://api.bigdatacloud.net/data/reverse-geocode-client', () =>
    HttpResponse.json({
      latitude: 51.5,
      longitude: -0.11,
      city: 'London',
      locality: 'Westminster',
      principalSubdivision: 'England',
      countryName: 'United Kingdom',
      countryCode: 'GB',
    }),
  ),
]
