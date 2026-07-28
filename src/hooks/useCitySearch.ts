import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { searchCities } from '@/api/geocoding'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useCitySearch(query: string) {
  const { i18n } = useTranslation()
  const debounced = useDebouncedValue(query.trim(), 300)

  return useQuery({
    queryKey: ['city-search', debounced, i18n.language],
    queryFn: () => searchCities(debounced, i18n.language),
    enabled: debounced.length >= 2,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
