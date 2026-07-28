import { afterEach, describe, expect, it } from 'vitest'
import { useLocationStore, type SavedLocation } from './locationStore'

function makeLocation(id: string): SavedLocation {
  return { id, name: `City ${id}`, country: 'Testland', admin1: null, latitude: 0, longitude: 0 }
}

afterEach(() => {
  useLocationStore.setState({ locations: [], activeLocationId: null })
})

describe('locationStore', () => {
  it('adds a location and makes it active', () => {
    useLocationStore.getState().addLocation(makeLocation('1'))
    const state = useLocationStore.getState()
    expect(state.locations).toHaveLength(1)
    expect(state.activeLocationId).toBe('1')
  })

  it('does not add a duplicate id, but activates it', () => {
    const { addLocation } = useLocationStore.getState()
    addLocation(makeLocation('1'))
    addLocation(makeLocation('2'))
    addLocation(makeLocation('1'))
    expect(useLocationStore.getState().locations).toHaveLength(2)
    expect(useLocationStore.getState().activeLocationId).toBe('1')
  })

  it('caps saved locations at 10', () => {
    const { addLocation } = useLocationStore.getState()
    for (let i = 0; i < 12; i++) addLocation(makeLocation(String(i)))
    expect(useLocationStore.getState().locations).toHaveLength(10)
  })

  it('removes a location and reassigns active if it was active', () => {
    const { addLocation, removeLocation } = useLocationStore.getState()
    addLocation(makeLocation('1'))
    addLocation(makeLocation('2'))
    removeLocation('2')
    expect(useLocationStore.getState().locations).toHaveLength(1)
    expect(useLocationStore.getState().activeLocationId).toBe('1')
  })

  it('reorders locations', () => {
    const { addLocation, reorderLocations } = useLocationStore.getState()
    addLocation(makeLocation('1'))
    addLocation(makeLocation('2'))
    addLocation(makeLocation('3'))
    reorderLocations(0, 2)
    expect(useLocationStore.getState().locations.map((l) => l.id)).toEqual(['2', '3', '1'])
  })
})
