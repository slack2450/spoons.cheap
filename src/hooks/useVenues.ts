import { useCallback, useEffect, useState } from 'react';

import { loadVenues } from '../api/client';
import type { Venue } from '../api/types';

type VenueLoader = (signal: AbortSignal) => Promise<Venue[]>;

type VenueLoadHandlers = {
  onStart: () => void;
  onSuccess: (venues: Venue[]) => void;
  onError: (error: unknown) => void;
};

export function beginVenueLoad(loader: VenueLoader, handlers: VenueLoadHandlers): () => void {
  const controller = new AbortController();
  handlers.onStart();

  void loader(controller.signal)
    .then((venues) => {
      if (!controller.signal.aborted) handlers.onSuccess(venues);
    })
    .catch((error: unknown) => {
      if (!controller.signal.aborted) handlers.onError(error);
    });

  return () => controller.abort();
}

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => beginVenueLoad(loadVenues, {
    onStart: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (loadedVenues) => {
      setVenues(loadedVenues);
      setLoading(false);
    },
    onError: (loadError) => {
      console.error('Failed to load pubs', loadError);
      setError('We could not load the pub list. Please try again shortly.');
      setLoading(false);
    },
  }), [attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  return { venues, error, loading, retry };
}
