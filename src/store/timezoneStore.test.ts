import { afterEach, describe, expect, it } from 'vitest'
import { useTimezoneStore, type TimezoneSelection } from './timezoneStore'

function makeSelection(id: string): TimezoneSelection {
  return { id, label: `Zone ${id}`, timezone: 'UTC' }
}

afterEach(() => {
  useTimezoneStore.setState({ selections: [] })
})

describe('timezoneStore', () => {
  it('adds a selection', () => {
    useTimezoneStore.getState().addSelection(makeSelection('1'))
    expect(useTimezoneStore.getState().selections).toHaveLength(1)
  })

  it('ignores duplicate ids', () => {
    const { addSelection } = useTimezoneStore.getState()
    addSelection(makeSelection('1'))
    addSelection(makeSelection('1'))
    expect(useTimezoneStore.getState().selections).toHaveLength(1)
  })

  it('caps selections at 5', () => {
    const { addSelection } = useTimezoneStore.getState()
    for (let i = 0; i < 7; i++) addSelection(makeSelection(String(i)))
    expect(useTimezoneStore.getState().selections).toHaveLength(5)
  })

  it('removes a selection', () => {
    const { addSelection, removeSelection } = useTimezoneStore.getState()
    addSelection(makeSelection('1'))
    addSelection(makeSelection('2'))
    removeSelection('1')
    expect(useTimezoneStore.getState().selections.map((s) => s.id)).toEqual(['2'])
  })
})
