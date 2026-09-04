import { useEffect } from 'react';
import { useIOSLandingLock } from './useIOSLandingLock';
import { useVisualViewport } from './useVisualViewport';
import { isIOSWebKit } from './viewport';

export function useLandingViewport(active: boolean): void {
  const ios = typeof navigator !== 'undefined' && isIOSWebKit(navigator);

  useEffect(() => {
    document.documentElement.classList.toggle('ios-viewport-workaround', ios);
    document.body.classList.toggle('landing-page', active);
    document.body.classList.toggle('ios-landing-page', ios && active);
    document.body.classList.toggle('results-page', !active);

    return () => {
      document.body.classList.remove('landing-page');
      document.body.classList.remove('ios-landing-page');
      document.body.classList.remove('results-page');
      document.documentElement.classList.remove('ios-viewport-workaround');
    };
  }, [active, ios]);

  useIOSLandingLock(ios, active);
  useVisualViewport();
}
