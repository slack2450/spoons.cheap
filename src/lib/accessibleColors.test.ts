import { describe, expect, it } from 'vitest';

import { accessibleText, contrastRatio } from './accessibleColors';

describe('small text palette', () => {
  it.each(Object.entries(accessibleText))('%s meets WCAG AA contrast', (_name, colors) => {
    expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
  });
});
