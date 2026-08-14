import { useEffect, useState } from 'react';
import { HighLevelVenue, venues } from 'wetherspoons-api';

import { Landing } from './components/Landing';
import { PubHeader } from './components/PubHeader';
import { useLandingViewport } from './hooks/useLandingViewport';
import SearchResults from './SearchResults';

function App() {
  const [pubs, setPubs] = useState<HighLevelVenue[]>([]);
  const [pubsError, setPubsError] = useState<string | null>(null);
  const [pubsLoading, setPubsLoading] = useState(true);
  const [pub, setPub] = useState<HighLevelVenue | null>(null);

  useLandingViewport(!pub);

  useEffect(() => {
    let cancelled = false;

    venues()
      .then((loadedPubs) => {
        if (!cancelled) {
          setPubs(loadedPubs);
          setPubsError(null);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load pubs', error);
        if (!cancelled) setPubsError('We could not load the pub list. Please try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setPubsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <main className={`w-full ${pub ? 'min-h-screen' : 'h-full min-h-0'}`}>
      {!pub && <Landing pubs={pubs} loading={pubsLoading} error={pubsError} onSelect={setPub} />}
      {pub && <PubHeader onClose={() => setPub(null)} />}
      <SearchResults pub={pub} />
      {pub && <footer className="grid min-h-[90px] place-items-center text-xs text-white/60">Made with 🍺 &amp; ❤️ by Joss</footer>}
    </main>
  );
}

export default App;
