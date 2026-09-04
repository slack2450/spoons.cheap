import { useState } from 'react';
import type { Venue } from './api/types';

import { Landing } from './components/Landing';
import { PubHeader } from './components/PubHeader';
import { useLandingViewport } from './hooks/useLandingViewport';
import { useVenues } from './hooks/useVenues';
import SearchResults from './SearchResults';

function App() {
  const [pub, setPub] = useState<Venue | null>(null);
  const { venues: pubs, error: pubsError, loading: pubsLoading, retry: retryPubs } = useVenues();

  useLandingViewport(!pub);

  return (
    <main className={`w-full ${pub ? 'min-h-screen' : 'h-full min-h-0'}`}>
      {!pub && <Landing pubs={pubs} loading={pubsLoading} error={pubsError} onRetry={retryPubs} onSelect={setPub} />}
      {pub && <PubHeader onClose={() => setPub(null)} />}
      <SearchResults pub={pub} />
      {pub && <footer className="grid min-h-[90px] place-items-center text-xs text-white/60">Made with 🍺 &amp; ❤️ by Joss</footer>}
    </main>
  );
}

export default App;
