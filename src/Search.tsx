import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';
import { HighLevelVenue } from 'wetherspoons-api';

type SearchProps = {
  options: HighLevelVenue[];
  loading: boolean;
  value: HighLevelVenue | null;
  onChange: (pub: HighLevelVenue | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

function locationFor(pub: HighLevelVenue): string {
  return pub.address.town || pub.address.county || 'United Kingdom';
}

function OpenStateBridge({ open, onOpen, onClose }: { open: boolean; onOpen?: () => void; onClose?: () => void }) {
  useEffect(() => {
    if (open) onOpen?.();
    else onClose?.();
  }, [onClose, onOpen, open]);

  return null;
}

export function Search({ options, loading, value, onChange, onOpen, onClose }: SearchProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matches = normalizedQuery
      ? options.filter((pub) => `${pub.name} ${locationFor(pub)}`.toLocaleLowerCase().includes(normalizedQuery))
      : options;
    return matches.slice(0, 100);
  }, [options, query]);

  return (
    <Combobox
      immediate
      nullable
      value={value}
      onChange={onChange}
      onClose={() => {
        setQuery('');
        setKeyboardNavigation(false);
        onClose?.();
      }}
    >
      {({ open }) => (
        <div className="relative w-full drop-shadow-[0_18px_25px_rgba(7,23,17,0.2)]">
          <OpenStateBridge open={open} onOpen={onOpen} />
          <div className="relative z-10 min-h-16 rounded-2xl bg-paper text-ink">
            <span className="pointer-events-none absolute inset-y-0 left-5 grid place-items-center" aria-hidden="true">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </span>
            <ComboboxInput
              className="h-16 w-full rounded-[inherit] border border-ink/15 bg-transparent pr-5 pl-14 text-base outline-none hover:border-ink/30 focus:border-ink"
              aria-label="Search by pub name or town"
              placeholder="Search by pub name or town…"
              displayValue={(pub: HighLevelVenue | null) => pub ? `${pub.name}, ${locationFor(pub)}` : ''}
              onChange={(event) => {
                setKeyboardNavigation(false);
                setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key)) {
                  setKeyboardNavigation(true);
                }
              }}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-[calc(100%-16px)] z-0 overflow-hidden rounded-b-2xl"
            aria-hidden={!open}
          >
            <ComboboxOptions
              static
              className={`max-h-[min(276px,calc(var(--visual-viewport-height,100dvh)_-_94px))] transform-gpu overflow-y-auto rounded-b-2xl border border-t-0 border-ink bg-paper px-1.5 pt-[22px] pb-1.5 text-ink outline-none transition-[translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'pointer-events-auto translate-y-0' : 'pointer-events-none -translate-y-full'}`}
            >
              {loading && <div className="px-4 py-3 text-sm text-ink/60" role="status">Loading pubs…</div>}
              {!loading && filteredOptions.length === 0 && <div className="px-4 py-3 text-sm text-ink/60">No matching pubs found</div>}
              {!loading && filteredOptions.map((pub) => (
                <ComboboxOption
                  key={pub.id}
                  value={pub}
                  onPointerMove={() => setKeyboardNavigation(false)}
                  className={({ focus }) => `flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none select-none hover:bg-ink/7 ${focus && keyboardNavigation ? 'bg-ink/7' : ''}`}
                >
                  <span className="text-[0.65rem] text-[#7b9d18]" aria-hidden="true">●</span>
                  <span className="flex min-w-0 flex-col">
                    <strong className="truncate font-semibold">{pub.name}</strong>
                    <small className="mt-0.5 truncate text-ink/60">{locationFor(pub)}</small>
                  </span>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </div>
        </div>
      )}
    </Combobox>
  );
}
