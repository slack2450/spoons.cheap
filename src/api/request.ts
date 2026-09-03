export const SERVER_REQUEST_TIMEOUT_MS = 35_000;

export class RequestTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'RequestTimeoutError';
  }
}

type RequestJsonOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function requestJson<T = unknown>(url: string, options: RequestJsonOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? SERVER_REQUEST_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new RangeError('Request timeout must be positive');

  const controller = new AbortController();
  let timedOut = false;

  const abortFromCaller = () => controller.abort();
  if (options.signal?.aborted) abortFromCaller();
  else options.signal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`API request failed with ${response.status}`);
    return await response.json() as T;
  } catch (error) {
    if (timedOut) throw new RequestTimeoutError(timeoutMs);
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}
