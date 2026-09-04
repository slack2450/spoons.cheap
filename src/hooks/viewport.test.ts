import { describe, expect, it } from 'vitest';
import { isIOSWebKit, landingScrollTop, viewportMeasurements } from './viewport';

describe('isIOSWebKit', () => {
  it('recognises iPhones', () => {
    expect(isIOSWebKit({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    })).toBe(true);
  });

  it('recognises iPads using a desktop user agent', () => {
    expect(isIOSWebKit({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    })).toBe(true);
  });

  it('does not treat an ordinary Mac as iOS', () => {
    expect(isIOSWebKit({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 0,
    })).toBe(false);
  });
});

describe('viewport measurements', () => {
  it('falls back to the window height without a visual viewport', () => {
    expect(viewportMeasurements(800)).toEqual({
      height: 800,
      offsetTop: 0,
      bottomInset: 0,
    });
  });

  it('accounts for browser chrome below the visible viewport', () => {
    expect(viewportMeasurements(800, { height: 650, offsetTop: 50 })).toEqual({
      height: 650,
      offsetTop: 50,
      bottomInset: 100,
    });
  });

  it('never reports a negative bottom inset', () => {
    expect(viewportMeasurements(800, { height: 850, offsetTop: 0 }).bottomInset).toBe(0);
  });

  it('centres the oversized landing surface', () => {
    expect(landingScrollTop(1600, 800)).toBe(400);
  });
});
