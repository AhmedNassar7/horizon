import { useEffect, useId, useState } from 'react'
import { useCommandState } from 'cmdk'
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

/**
 * Mirrors cmdk's own <CommandInput> highlighted-option tracking so our custom
 * <Input> (used instead of CommandInput for the icon/spinner layout) can
 * still expose aria-activedescendant, per the WAI-ARIA APG combobox pattern.
 * `selectedItemId` is the real DOM id cmdk assigns to the highlighted
 * <CommandItem> — cmdk always overwrites any `id` prop we pass ourselves, so
 * this state value is the only reliable way to know it.
 */
function ActiveOptionSync({ onActiveChange }: { onActiveChange: (id: string) => void }) {
  const selectedItemId = useCommandState((state) => state.selectedItemId ?? '')
  useEffect(() => {
    onActiveChange(selectedItemId)
  }, [selectedItemId, onActiveChange])
  return null
}

export function CitySearch({ onSelect }: { onSelect: (city: CityResult) => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [activeOptionId, setActiveOptionId] = useState('')
  // cmdk always overwrites any `id` we pass to <CommandList>, so the only way
  // to point aria-controls at the real listbox id is to read it back off the
  // rendered DOM node once cmdk has mounted it.
  const [listboxId, setListboxId] = useState<string | undefined>()
  const captureListboxId = (node: HTMLDivElement | null) => {
    setListboxId(node?.querySelector('[cmdk-list]')?.id)
  }
  const inputId = useId()

  const { data: results = [], isFetching } = useCitySearch(query)
  const isOpen = query.trim().length >= 2

  const selectCity = (city: CityResult) => {
    onSelect(city)
    setQuery('')
  }

  return (
    // <Command> wraps the input *and* the popover (rather than just the
    // popover) so cmdk's arrow-key/Enter handling — which listens on its own
    // root element — actually receives keydown events bubbling up from the
    // plain <Input> below. The input lives outside <CommandList>, so without
    // this shared ancestor, arrow keys would move a visible highlight but
    // Enter would never fire onSelect, leaving the combobox mouse-only.
    // className="contents" keeps the extra wrapper from affecting layout.
    <Command shouldFilter={false} className="contents">
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
              // This *is* an <input>; role="combobox" is the correct ARIA
              // 1.2 combobox pattern on top of it (same as cmdk's own
              // CommandInput sets internally), not a substitute for one.
              role="combobox" // oxlint-disable-line prefer-tag-over-role
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={isOpen ? activeOptionId || undefined : undefined}
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
          <div ref={captureListboxId} className="contents">
            <CommandList>
              <ActiveOptionSync onActiveChange={setActiveOptionId} />
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
          </div>
        </PopoverContent>
      </Popover>
    </Command>
  )
}
