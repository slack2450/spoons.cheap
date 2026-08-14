import { useEffect, useState } from 'react';
import { Drink, DrinksUnavailableReason, getDrinks, HighLevelVenue } from 'wetherspoons-api';

import { DrinkCard } from './components/DrinkCard';

const gridClasses = 'grid grid-cols-3 items-start gap-4 max-md:grid-cols-2 max-sm:grid-cols-1';

export default function SearchResults({ pub }: { pub: HighLevelVenue | null }): JSX.Element | null {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!pub) return;

    setDrinks([]);
    setError(null);
    setUnavailableMessage(null);
    setLoading(true);
    getDrinks(pub)
      .then((result) => {
        if (cancelled) return;
        setDrinks(result.drinks);
        if (result.status === 'unavailable') setUnavailableMessage(unavailableMenuMessage(result.reason));
      })
      .catch((requestError: unknown) => {
        console.error(`Failed to load drinks for ${pub.name}`, requestError);
        if (!cancelled) setError('We could not load this menu. The pub may not be taking app orders right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pub]);

  if (!pub) return null;

  return (
    <section className="w-full rounded-t-[40px] bg-cream px-[max(20px,calc((100%_-_1180px)/2))] pt-[42px] pb-[100px] text-ink max-sm:rounded-t-[26px] max-sm:pt-[30px] max-sm:pb-[70px]">
      <header className="mb-[38px] flex items-end justify-between gap-6 max-sm:mb-7 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="mb-3.5 text-xs font-bold tracking-[0.17em] text-[#657d14] uppercase">Best value first</p>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] leading-none font-semibold tracking-[-0.055em]">{pub.name}</h2>
          <p className="mt-3.5 text-[#6b756f]">{pub.address.town || pub.address.county} · Drinks ranked by price per unit</p>
        </div>
        {!loading && !error && <span className="shrink-0 rounded-full border border-[#d3d7d1] px-[15px] py-2.5 text-xs font-semibold text-[#53615a]">{drinks.length} drinks</span>}
      </header>

      {loading && (
        <div className={gridClasses} role="status" aria-label="Loading menu" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((item) => <div className="h-[230px] animate-pulse rounded-[20px] bg-ink/8" key={item} />)}
        </div>
      )}
      {error && <ResultMessage role="alert" title="Menu unavailable">{error}</ResultMessage>}
      {!loading && !error && drinks.length === 0 && (
        <ResultMessage title="No drinks showing">{unavailableMessage ?? 'This pub has no drinks menu available at the moment.'}</ResultMessage>
      )}
      {drinks.length > 0 && (
        <div className={gridClasses}>
          {drinks.map((drink, index) => <DrinkCard key={drink.productId} drink={drink} position={index} pub={pub} />)}
        </div>
      )}
    </section>
  );
}

function ResultMessage({ title, children, role }: { title: string; children: React.ReactNode; role?: 'alert' }) {
  return (
    <div className="grid min-h-[220px] place-content-center place-items-center gap-2 rounded-[20px] border border-[#dedfd9] bg-paper p-[30px] text-center text-[#6b756f]" role={role}>
      <strong className="text-xl text-ink">{title}</strong>
      <span>{children}</span>
    </div>
  );
}

function unavailableMenuMessage(reason: DrinksUnavailableReason): string {
  switch (reason) {
    case 'venue-closed': return 'This pub is currently closed, so its drinks menu is unavailable.';
    case 'ordering-unavailable': return 'This pub is not taking app orders right now.';
    case 'no-sales-area': return 'This pub does not currently expose an ordering area.';
    case 'no-orderable-menus':
    case 'no-usable-drinks': return 'This pub has no orderable drinks available at the moment.';
  }
}
