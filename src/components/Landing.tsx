import { useEffect, useState } from 'react';
import { HighLevelVenue } from 'wetherspoons-api';

import { Search } from '../Search';
import { Brand } from './Brand';

type LandingProps = {
  pubs: HighLevelVenue[];
  loading: boolean;
  error: string | null;
  onSelect: (pub: HighLevelVenue | null) => void;
};

export function Landing({ pubs, loading, error, onSelect }: LandingProps) {
  const [searchActive, setSearchActive] = useState(false);
  const [creditVisible, setCreditVisible] = useState(true);

  useEffect(() => {
    if (searchActive) {
      setCreditVisible(false);
      return;
    }

    const revealTimer = window.setTimeout(() => setCreditVisible(true), 600);
    return () => window.clearTimeout(revealTimer);
  }, [searchActive]);

  return (
    <section className="relative isolate h-full min-h-0 w-full">
      <div
        data-active={searchActive}
        className="absolute left-1/2 top-[calc(50%+32px)] w-[min(820px,calc(100%_-_40px))] -translate-x-1/2 transition-[top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-sm:top-[calc(50%+8px)] max-sm:w-[calc(100%_-_24px)] max-sm:data-[active=true]:top-[max(56px,calc(var(--visual-viewport-offset-top,0px)+env(safe-area-inset-top)+8px))]"
      >
        <div
          data-active={searchActive}
          className="absolute bottom-[calc(100%+34px)] left-1/2 -translate-x-1/2 transition-[opacity,translate,scale] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] max-sm:bottom-[calc(100%+28px)] max-sm:data-[active=true]:pointer-events-none max-sm:data-[active=true]:-translate-y-3 max-sm:data-[active=true]:scale-[0.96] max-sm:data-[active=true]:opacity-0"
        >
          <Brand component="h1" />
        </div>

        <div className="w-full">
          <Search
            options={pubs}
            loading={loading}
            value={null}
            onChange={onSelect}
            onOpen={() => setSearchActive(true)}
            onClose={() => setSearchActive(false)}
          />
          {error && <p className="m-[8px_6px_2px] p-[10px_12px] text-[0.85rem] text-[#ffd6cb]" role="alert">{error}</p>}
        </div>
      </div>

      <p
        data-animate={!searchActive && creditVisible}
        data-hidden={searchActive || !creditVisible}
        className="absolute inset-x-0 bottom-[max(26px,calc(env(safe-area-inset-bottom)+12px))] text-center text-xs whitespace-nowrap text-white/60 transition-opacity duration-300 max-sm:bottom-[max(72px,calc(env(safe-area-inset-bottom)+58px),calc(var(--browser-bottom-inset,0px)+18px))] max-sm:data-[hidden=true]:pointer-events-none max-sm:data-[hidden=true]:opacity-0"
      >
        Made with <span className="credit-beer" aria-hidden="true">🍺</span> &amp; <span className="credit-heart" aria-hidden="true">❤️</span> by Joss
      </p>
    </section>
  );
}
