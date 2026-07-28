import { useId, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCitySearch } from '@/hooks/useCitySearch'
import type { CityResult } from '@/schemas/geocoding'

export function CitySearch({ onSelect }: { onSelect: (city: CityResult) => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const inputId = useId()

  const { data: results = [], isFetching } = useCitySearch(query)
  const isOpen = query.trim().length >= 2

  const selectCity = (city: CityResult) => {
    onSelect(city)
    setQuery('')
  }

  return (
    <Popover open={isOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full max-w-md">
          <label htmlFor={inputId} className="sr-only">
            {t('search.placeholder')}
          </label>
          <Input
            id={inputId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-10 pl-3"
            autoComplete="off"
          />
          {isFetching && (
            <Loader2
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
            />
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-(--radix-popover-anchor-width) p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>
              {isFetching ? t('search.searching') : t('search.noResults')}
            </CommandEmpty>
            <CommandGroup>
              {results.map((city) => (
                <CommandItem key={city.id} onSelect={() => selectCity(city)} value={city.id}>
                  <MapPin aria-hidden="true" className="text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{city.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {[city.admin1, city.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
