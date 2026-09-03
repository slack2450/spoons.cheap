import { describe, expect, it, vi } from 'vitest';

import type { Venue } from '../api/types';
import { beginVenueLoad } from './useVenues';

const venue: Venue = {
  address: {},
  franchise: 'jdw',
  id: 1,
  isClosed: false,
  name: 'Test pub',
  venueRef: 123,
};

async function settlePromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('beginVenueLoad', () => {
  it('allows a failed load to be retried without reloading the page', async () => {
    const onStart = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const loader = vi.fn()
      .mockRejectedValueOnce(new Error('temporary outage'))
      .mockResolvedValueOnce([venue]);
    const handlers = { onStart, onSuccess, onError };

    const cancelFirst = beginVenueLoad(loader, handlers);
    await settlePromises();
    expect(onError).toHaveBeenCalledOnce();

    cancelFirst();
    const cancelRetry = beginVenueLoad(loader, handlers);
    await settlePromises();

    expect(onStart).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledWith([venue]);
    expect(loader).toHaveBeenCalledTimes(2);
    cancelRetry();
  });

  it('aborts superseded loads and ignores their stale result', async () => {
    let resolveFirst: ((venues: Venue[]) => void) | undefined;
    let firstSignal: AbortSignal | undefined;
    const onSuccess = vi.fn();
    const handlers = { onStart: vi.fn(), onSuccess, onError: vi.fn() };
    const firstLoader = vi.fn((signal: AbortSignal) => {
      firstSignal = signal;
      return new Promise<Venue[]>((resolve) => { resolveFirst = resolve; });
    });

    const cancelFirst = beginVenueLoad(firstLoader, handlers);
    cancelFirst();
    beginVenueLoad(vi.fn().mockResolvedValue([venue]), handlers);
    resolveFirst?.([{ ...venue, name: 'Stale pub' }]);
    await settlePromises();

    expect(firstSignal?.aborted).toBe(true);
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith([venue]);
  });

  it('suppresses errors after unmount cancellation', async () => {
    let rejectLoad: ((error: Error) => void) | undefined;
    const onError = vi.fn();
    const cancel = beginVenueLoad(
      () => new Promise<Venue[]>((_resolve, reject) => { rejectLoad = reject; }),
      { onStart: vi.fn(), onSuccess: vi.fn(), onError },
    );

    cancel();
    rejectLoad?.(new Error('late failure'));
    await settlePromises();

    expect(onError).not.toHaveBeenCalled();
  });
});
