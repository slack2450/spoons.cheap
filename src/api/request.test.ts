import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestJson, RequestTimeoutError } from './request';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('requestJson', () => {
  it('returns parsed JSON and clears its deadline', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ready: true }),
    }));

    await expect(requestJson('/test', { timeoutMs: 100 })).resolves.toEqual({ ready: true });
    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });

  it('aborts and reports a request deadline', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    })));

    const request = requestJson('/slow', { timeoutMs: 100 });
    const rejection = expect(request).rejects.toBeInstanceOf(RequestTimeoutError);
    await vi.advanceTimersByTimeAsync(100);
    await rejection;
  });

  it('propagates caller cancellation without relying on AbortSignal.any', async () => {
    const caller = new AbortController();
    let receivedSignal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => {
      receivedSignal = init?.signal ?? undefined;
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      });
    }));

    const request = requestJson('/cancelled', { signal: caller.signal, timeoutMs: 1_000 });
    caller.abort();

    expect(receivedSignal?.aborted).toBe(true);
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects HTTP failures consistently', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(requestJson('/down')).rejects.toThrow('API request failed with 503');
  });
});
