import { useQuery } from '@tanstack/react-query'
import { searchCities } from '@/api/geocoding'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useCitySearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 300)

  return useQuery({
    queryKey: ['city-search', debounced],
    queryFn: () => searchCities(debounced),
    enabled: debounced.length >= 2,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
