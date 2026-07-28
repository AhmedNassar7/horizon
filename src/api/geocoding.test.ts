import { describe, expect, it } from 'vitest'
import { searchCities } from './geocoding'

describe('searchCities', () => {
  it('returns an empty array for a too-short query without hitting the network', async () => {
    expect(await searchCities('l')).toEqual([])
  })

  it('normalizes geocoding results', async () => {
    const results = await searchCities('London')
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ name: 'London', country: 'United Kingdom' })
  })
})
