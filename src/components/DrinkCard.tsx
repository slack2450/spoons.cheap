import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useId, useState } from 'react';
import { Drink, HighLevelVenue } from 'wetherspoons-api';

import { PriceRange, usePriceHistory } from '../hooks/usePriceHistory';
import { PriceHistory } from './PriceHistory';

function money(value: number | null | undefined, places = 2): string {
  return typeof value === 'number' ? `£${value.toFixed(places)}` : '—';
}

export function DrinkCard({ drink, position, pub }: { drink: Drink; position: number; pub: HighLevelVenue }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<PriceRange>('7d');
  const reduceMotion = useReducedMotion();
  const historyId = useId();
  const history = usePriceHistory(pub, drink, open, range);

  function toggleDetails() {
    const opening = !open;
    setOpen(opening);
  }

  return (
    <motion.article
      layout={!reduceMotion}
      className={`overflow-hidden rounded-[20px] border shadow-[0_10px_30px_rgba(21,35,28,0.035)] transition-[border-color,box-shadow,translate,background] duration-180 hover:shadow-[0_18px_38px_rgba(21,35,28,0.08)] ${open ? 'border-ink bg-ink text-[#f4f5f0]' : 'border-[#dedfd9] bg-paper text-ink hover:-translate-y-0.5 hover:border-[#bec4b9]'}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.32, delay: Math.min(position * 0.025, 0.28) }}
    >
      <button
        type="button"
        onClick={toggleDetails}
        className={`block w-full cursor-pointer p-[22px] text-left text-inherit focus-visible:outline-3 focus-visible:-outline-offset-4 ${open ? 'focus-visible:outline-lime' : 'focus-visible:outline-[#657d14]'}`}
        aria-expanded={open}
        aria-controls={historyId}
      >
        <div className="flex min-h-[25px] items-center gap-2">
          <span className="text-[0.68rem] font-bold tracking-[0.09em] text-[#7b867f]">#{String(position + 1).padStart(2, '0')}</span>
          {position < 3 && <span className="rounded-full bg-lime px-2 py-1 text-[0.61rem] font-bold tracking-[0.04em] text-[#425408] uppercase">Best value</span>}
          <span className={`ml-auto grid size-[25px] place-items-center rounded-full border text-[1.05rem] leading-none ${open ? 'border-lime/35 text-lime' : 'border-[#d4d8d1]'}`} aria-hidden="true">{open ? '−' : '+'}</span>
        </div>

        <h3 className="my-[22px] min-h-[50px] text-[1.08rem] leading-[1.4] font-semibold tracking-[-0.025em] max-sm:min-h-0">{drink.name}</h3>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <strong className="text-[1.9rem] leading-none tracking-[-0.06em]">{money(drink.ppu, 3)}</strong>
            <span className={`mt-1.5 text-[0.67rem] ${open ? 'text-muted' : 'text-[#737e77]'}`}>per alcohol unit</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-[0.65rem] text-[#7a847e] [&_strong]:text-xs">
            <span><strong>{money(drink.price)}</strong> menu price</span>
            <span><strong>{drink.units.toFixed(2)}</strong> units</span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && <PriceHistory id={historyId} range={range} onRangeChange={setRange} {...history} />}
      </AnimatePresence>
    </motion.article>
  );
}
